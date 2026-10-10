import { useEffect, useState, type ReactNode } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { getErrorMessage } from '../api/client'
import { createTask, getProject, type TaskFields } from '../api/tasks'
import { getSession } from '../auth/session'
import ErrorAlert from '../components/ErrorAlert'
import TaskForm from '../components/TaskForm'
import TaskItem from '../components/TaskItem'
import WakingUpNotice from '../components/WakingUpNotice'
import { isTaskStatus, STATUSES, STATUS_LABELS } from '../labels'
import { secondaryButtonClass } from '../styles'
import type { ProjectWithTasks, Task, TaskStatus } from '../types'

type ProjectState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; project: ProjectWithTasks }

export default function ProjectDetailPage() {
  const projectId = Number(useParams().projectId)
  const [searchParams, setSearchParams] = useSearchParams()
  const [state, setState] = useState<ProjectState>({ status: 'loading' })
  const [reloadKey, setReloadKey] = useState(0)

  // The filter lives in the URL (?status=DONE) so it survives a reload.
  const statusParam = searchParams.get('status')
  const statusFilter = isTaskStatus(statusParam) ? statusParam : null

  // UI-only check: the backend rejects deletes from non-admins anyway.
  const isAdmin = getSession()?.role === 'ADMIN'

  useEffect(() => {
    let ignore = false
    getProject(projectId)
      .then((project) => {
        if (!ignore) setState({ status: 'ready', project })
      })
      .catch((err) => {
        if (!ignore) setState({ status: 'error', message: getErrorMessage(err) })
      })
    return () => {
      ignore = true
    }
  }, [projectId, reloadKey])

  function retry() {
    setState({ status: 'loading' })
    setReloadKey((key) => key + 1)
  }

  function setFilter(status: TaskStatus | null) {
    setSearchParams(status ? { status } : {})
  }

  // Apply API results locally instead of refetching the whole project.
  function updateTasks(update: (tasks: Task[]) => Task[]) {
    setState((current) =>
      current.status === 'ready'
        ? { status: 'ready', project: { ...current.project, tasks: update(current.project.tasks) } }
        : current,
    )
  }

  async function handleCreate(fields: TaskFields) {
    const task = await createTask(projectId, fields)
    updateTasks((tasks) => [task, ...tasks])
  }

  function handleUpdated(updated: Task) {
    updateTasks((tasks) => tasks.map((task) => (task.id === updated.id ? updated : task)))
  }

  function handleDeleted(taskId: number) {
    updateTasks((tasks) => tasks.filter((task) => task.id !== taskId))
  }

  const backLink = (
    <Link to="/projects" className="text-sm text-indigo-600 hover:underline">
      ← All projects
    </Link>
  )

  if (state.status === 'loading') {
    return (
      <section className="space-y-3">
        {backLink}
        <p className="text-slate-600">Loading project…</p>
        <WakingUpNotice active />
      </section>
    )
  }

  if (state.status === 'error') {
    return (
      <section className="space-y-3">
        {backLink}
        <ErrorAlert message={state.message} />
        <button type="button" onClick={retry} className={secondaryButtonClass}>
          Try again
        </button>
      </section>
    )
  }

  const { project } = state
  // All tasks are already loaded with the project, so filtering happens on the client:
  // it's instant and avoids another request to a server that may be asleep.
  // In "All", completed tasks sink to the bottom. toSorted is stable, so the
  // relative order within each group stays as it was.
  const visibleTasks = statusFilter
    ? project.tasks.filter((task) => task.status === statusFilter)
    : project.tasks.toSorted((a, b) => Number(a.status === 'DONE') - Number(b.status === 'DONE'))

  return (
    <section className="space-y-6">
      <div>
        {backLink}
        <h1 className="mt-2 text-2xl font-bold">{project.name}</h1>
        {project.description && <p className="mt-1 text-slate-600">{project.description}</p>}
      </div>

      <div>
        <h2 className="mb-2 font-semibold">New task</h2>
        <TaskForm submitLabel="Add task" onSubmit={handleCreate} />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Tasks</h2>
          <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by status">
            <FilterButton active={statusFilter === null} onClick={() => setFilter(null)}>
              All ({project.tasks.length})
            </FilterButton>
            {STATUSES.map((status) => (
              <FilterButton
                key={status}
                active={statusFilter === status}
                onClick={() => setFilter(status)}
              >
                {STATUS_LABELS[status]} ({project.tasks.filter((t) => t.status === status).length})
              </FilterButton>
            ))}
          </div>
        </div>

        {visibleTasks.length === 0 ? (
          <p className="text-slate-600">
            {project.tasks.length === 0 ? 'No tasks yet. Add the first one above.' : 'No tasks with this status.'}
          </p>
        ) : (
          <ul className="space-y-3">
            {visibleTasks.map((task) => (
              <li key={task.id}>
                <TaskItem
                  task={task}
                  canDelete={isAdmin}
                  onUpdated={handleUpdated}
                  onDeleted={handleDeleted}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

interface FilterButtonProps {
  active: boolean
  onClick: () => void
  children: ReactNode
}

function FilterButton({ active, onClick, children }: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded px-3 py-1 text-sm font-medium ${
        active ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  )
}
