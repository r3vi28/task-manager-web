import type { Role } from '../types'

const TOKEN_KEY = 'token'

interface JwtPayload {
  id: number
  role: Role
  iat: number
  exp: number // seconds since epoch
}

export interface Session {
  token: string
  userId: number
  role: Role
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// Returns null when there is no token, it can't be decoded, or it has expired.
// The role is only used to show or hide UI; the backend still enforces it.
export function getSession(): Session | null {
  const token = getToken()
  if (!token) return null

  const payload = decodeJwtPayload(token)
  if (!payload || payload.exp * 1000 <= Date.now()) return null

  return { token, userId: payload.id, role: payload.role }
}

// Reads the JWT payload without verifying the signature (only the server can do that).
function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1]
    // JWTs use base64url: swap the URL-safe characters and restore the padding for atob.
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const data = JSON.parse(atob(padded))

    if (typeof data.exp !== 'number' || typeof data.id !== 'number') return null
    if (data.role !== 'ADMIN' && data.role !== 'MEMBER') return null
    return data as JwtPayload
  } catch {
    return null
  }
}
