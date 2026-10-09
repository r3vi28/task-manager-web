import { useEffect, useState, type SubmitEvent } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { login, wakeUpServer } from '../api/auth'
import { ApiError, type FieldErrors } from '../api/client'
import { getSession, setToken } from '../auth/session'
import { useIsSlow } from '../hooks/useIsSlow'

const DEMO_EMAIL = 'member@demo.com'
const DEMO_PASSWORD = 'Demo1234!'

const inputClass =
  'mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const isSlow = useIsSlow(isSubmitting)

  useEffect(() => {
    wakeUpServer()
  }, [])

  if (getSession()) return <Navigate to="/projects" replace />

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setFieldErrors({})

    try {
      const { token } = await login(email, password)
      setToken(token)
      navigate('/projects', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Invalid email or password.')
      } else if (err instanceof ApiError) {
        setError(err.message)
        setFieldErrors(err.fieldErrors)
      } else {
        setError('Something went wrong. Please try again.')
      }
      setIsSubmitting(false)
    }
  }

  function fillDemoAccount() {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-900">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Task Manager</h1>
        <p className="mt-1 text-sm text-slate-600">Sign in to manage your projects.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <label className="block text-sm font-medium">
            Email
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
            {fieldErrors.email && <span className="mt-1 block text-red-600">{fieldErrors.email[0]}</span>}
          </label>

          <label className="block text-sm font-medium">
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            {fieldErrors.password && (
              <span className="mt-1 block text-red-600">{fieldErrors.password[0]}</span>
            )}
          </label>

          {error && (
            <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          {isSlow && (
            <p role="status" className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Waking up the server… It runs on a free plan and sleeps when idle, so the first
              request can take up to a minute.
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded bg-indigo-600 px-3 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
          <button
            type="button"
            onClick={fillDemoAccount}
            disabled={isSubmitting}
            className="w-full rounded border border-slate-300 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Use demo account
          </button>
        </form>
      </div>
    </main>
  )
}
