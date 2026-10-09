import { Link, Navigate, Outlet, useNavigate } from 'react-router'
import { clearToken, getSession } from '../auth/session'

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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link to="/projects" className="text-lg font-semibold">
            Task Manager
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600">{session.role}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded px-2 py-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
