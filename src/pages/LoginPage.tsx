import { useEffect, useState, type SubmitEvent } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { login, wakeUpServer } from '../api/auth'
import { ApiError, type FieldErrors } from '../api/client'
import { getSession, setToken } from '../auth/session'
import ErrorAlert from '../components/ErrorAlert'
import FieldError from '../components/FieldError'
import WakingUpNotice from '../components/WakingUpNotice'
import { inputClass, primaryButtonClass, secondaryButtonClass } from '../styles'

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
            <FieldError messages={fieldErrors.email} />
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
            <FieldError messages={fieldErrors.password} />
          </label>

          <ErrorAlert message={error} />
          <WakingUpNotice active={isSubmitting} />

          <button type="submit" disabled={isSubmitting} className={`w-full ${primaryButtonClass}`}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
          <button
            type="button"
            onClick={fillDemoAccount}
            disabled={isSubmitting}
            className={`w-full ${secondaryButtonClass}`}
          >
            Use demo account
          </button>
        </form>
      </div>
    </main>
  )
}
