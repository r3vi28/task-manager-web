import { Link, Navigate, Outlet, useNavigate } from 'react-router'
import { clearToken, getSession } from '../auth/session'
import { focusRing, ghostButtonClass } from '../styles'
import { LogoMark } from './icons'

// Guards every private route and renders the shared header.
export default function ProtectedLayout() {
  const navigate = useNavigate()
  const session = getSession()

  if (!session) return <Navigate to="/login" replace />

  // There is no logout endpoint: dropping the token is enough.
  function handleLogout() {
    clearToken()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            to="/projects"
            className={`flex items-center gap-2.5 rounded-lg font-semibold tracking-tight ${focusRing}`}
          >
            <LogoMark />
            Task Manager
          </Link>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-500/15 dark:text-indigo-300">
              {session.role === 'ADMIN' ? 'Admin' : 'Member'}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className={`${ghostButtonClass} text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white`}
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
