import { clearToken, getToken } from '../auth/session'

const API_URL = import.meta.env.VITE_API_URL.replace(/\/+$/, '')

export type FieldErrors = Record<string, string[]>

export class ApiError extends Error {
  status: number
  fieldErrors: FieldErrors

  constructor(status: number, message: string, fieldErrors: FieldErrors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export function getErrorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  // Public endpoints (login, health) send no token and skip the 401 redirect.
  auth?: boolean
}

// No timeout on purpose: the API sleeps on its free plan and the first
// request can take close to a minute.
export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, auth = true }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const token = auth ? getToken() : null
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.')
  }

  if (response.status === 401 && auth) {
    clearToken()
    window.location.assign('/login')
    throw new ApiError(401, 'Your session has expired. Please log in again.')
  }

  const data = await parseBody(response)
  if (!response.ok) throw toApiError(response.status, data)
  return data as T
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return undefined
  try {
    return JSON.parse(text)
  } catch {
    // Some backend errors (e.g. malformed JSON) come back as an HTML page.
    return text
  }
}

// The API returns { message: string } or { message: { field: string[] } }.
function toApiError(status: number, data: unknown): ApiError {
  const message = isRecord(data) ? data.message : undefined

  if (typeof message === 'string') return new ApiError(status, message)

  if (isRecord(message)) {
    const fieldErrors: FieldErrors = {}
    for (const [field, errors] of Object.entries(message)) {
      fieldErrors[field] = Array.isArray(errors) ? errors.map(String) : [String(errors)]
    }
    return new ApiError(status, 'Please fix the errors below.', fieldErrors)
  }

  return new ApiError(status, `Unexpected server error (${status}). Please try again.`)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
