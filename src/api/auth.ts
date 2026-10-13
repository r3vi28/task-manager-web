import type { LoginResponse } from '../types'
import { apiRequest } from './client'

export function login(email: string, password: string) {
  return apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  })
}

// Fire-and-forget request so the sleeping server starts booting
// while the user is still typing their credentials.
export function wakeUpServer() {
  apiRequest('/health', { auth: false }).catch(() => {})
}
