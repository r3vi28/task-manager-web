import { useEffect, useState, type SubmitEvent } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { login, wakeUpServer } from '../api/auth'
import { API_URL, ApiError, type FieldErrors } from '../api/client'
import { getSession, setToken } from '../auth/session'
import ErrorAlert from '../components/ErrorAlert'
import FieldError from '../components/FieldError'
import { LogoMark } from '../components/icons'
import WakingUpNotice from '../components/WakingUpNotice'
import {
  cardClass,
  focusRing,
  inputClass,
  labelClass,
  mutedTextClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../styles'

const DEMO_EMAIL = 'member@demo.com'
const DEMO_PASSWORD = 'Demo1234!'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

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
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <LogoMark className="size-11" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Sign in to Task Manager</h1>
          <p className={`mt-1 text-sm ${mutedTextClass}`}>Manage your projects and tasks.</p>
        </div>

        <form onSubmit={handleSubmit} className={`${cardClass} mt-8 space-y-4 p-6`} noValidate>
          <label className={labelClass}>
            Email
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
            <FieldError messages={fieldErrors.email} />
          </label>

          <label className={labelClass}>
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            <FieldError messages={fieldErrors.password} />
          </label>

          <ErrorAlert message={error} />
          <WakingUpNotice active={isSubmitting} />

          <button type="submit" disabled={isSubmitting} className={`w-full ${primaryButtonClass}`}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            or
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>

          <button
            type="button"
            onClick={fillDemoAccount}
            disabled={isSubmitting}
            className={`w-full ${secondaryButtonClass}`}
          >
            Use demo account
          </button>
        </form>

        <p className={`mt-6 text-center text-sm ${mutedTextClass}`}>
          Web client for the{' '}
          <a
            href={`${API_URL}/api/docs`}
            target="_blank"
            rel="noreferrer"
            className={`rounded font-medium text-indigo-600 hover:underline dark:text-indigo-400 ${focusRing}`}
          >
            Task Manager API
          </a>
        </p>
      </div>
    </main>
  )
}
