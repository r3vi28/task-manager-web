import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { getErrorMessage } from '../api/client'
import { createTask, getProject, type TaskFields } from '../api/tasks'
import { getSession } from '../auth/session'
import EmptyState from '../components/EmptyState'
import ErrorAlert from '../components/ErrorAlert'
import { ArrowLeftIcon, ClipboardIcon, PlusIcon } from '../components/icons'
import Modal from '../components/Modal'
import SkeletonList from '../components/SkeletonList'
import TaskForm from '../components/TaskForm'
import TaskItem from '../components/TaskItem'
import WakingUpNotice from '../components/WakingUpNotice'
import { isTaskStatus, STATUSES, STATUS_LABELS } from '../labels'
import { focusRing, mutedTextClass, primaryButtonClass, secondaryButtonClass } from '../styles'
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
  const [isCreating, setIsCreating] = useState(false)

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
    setIsCreating(false)
  }

  function handleUpdated(updated: Task) {
    updateTasks((tasks) => tasks.map((task) => (task.id === updated.id ? updated : task)))
  }

  function handleDeleted(taskId: number) {
    updateTasks((tasks) => tasks.filter((task) => task.id !== taskId))
  }

  const backLink = (
    <Link
      to="/projects"
      className={`-ml-1 inline-flex items-center gap-1.5 rounded px-1 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 ${focusRing}`}
    >
      <ArrowLeftIcon />
      All projects
    </Link>
  )

  if (state.status === 'loading') {
    return (
      <section className="space-y-6">
        {backLink}
        <div aria-hidden="true" className="h-8 w-1/2 animate-pulse rounded-lg bg-slate-200 motion-reduce:animate-none dark:bg-slate-800" />
        <WakingUpNotice active />
        <SkeletonList count={3} label="Loading project…" className="space-y-3" />
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

  const newTaskButton = (
    <button type="button" onClick={() => setIsCreating(true)} className={primaryButtonClass}>
      <PlusIcon />
      New task
    </button>
  )

  return (
    <section className="space-y-6">
      <div>
        {backLink}
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight break-words">{project.name}</h1>
            {project.description && (
              <p className={`mt-1 text-sm ${mutedTextClass}`}>{project.description}</p>
            )}
          </div>
          {newTaskButton}
        </div>
      </div>

      {isCreating && (
        <Modal title="New task" onClose={() => setIsCreating(false)}>
          <TaskForm
            submitLabel="Create task"
            onSubmit={handleCreate}
            onCancel={() => setIsCreating(false)}
          />
        </Modal>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Tasks</h2>
          {/* Segmented control: aria-pressed tells screen readers which filter is on. */}
          <div
            role="group"
            aria-label="Filter by status"
            className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800/60"
          >
            <FilterButton
              label="All"
              count={project.tasks.length}
              active={statusFilter === null}
              onClick={() => setFilter(null)}
            />
            {STATUSES.map((status) => (
              <FilterButton
                key={status}
                label={STATUS_LABELS[status]}
                count={project.tasks.filter((t) => t.status === status).length}
                active={statusFilter === status}
                onClick={() => setFilter(status)}
              />
            ))}
          </div>
        </div>

        {project.tasks.length === 0 ? (
          <EmptyState
            icon={<ClipboardIcon className="size-6" />}
            title="No tasks yet"
            description="Break this project down into tasks and track them from to do to done."
            action={newTaskButton}
          />
        ) : visibleTasks.length === 0 ? (
          <EmptyState
            icon={<ClipboardIcon className="size-6" />}
            title="Nothing here"
            description="No tasks match this filter."
            action={
              <button type="button" onClick={() => setFilter(null)} className={secondaryButtonClass}>
                Show all tasks
              </button>
            }
          />
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
  label: string
  count: number
  active: boolean
  onClick: () => void
}

function FilterButton({ label, count, active, onClick }: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors ${focusRing} ${
        active
          ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
      }`}
    >
      {label} <span className="font-normal tabular-nums">{count}</span>
    </button>
  )
}
