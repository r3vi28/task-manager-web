import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getErrorMessage } from '../api/client'
import { getProjects } from '../api/projects'
import CreateProjectForm from '../components/CreateProjectForm'
import EmptyState from '../components/EmptyState'
import ErrorAlert from '../components/ErrorAlert'
import { FolderIcon, PlusIcon } from '../components/icons'
import Modal from '../components/Modal'
import SkeletonList from '../components/SkeletonList'
import WakingUpNotice from '../components/WakingUpNotice'
import {
  cardClass,
  focusRing,
  mutedTextClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../styles'
import type { Project, ProjectWithTasks } from '../types'

// One state value instead of separate loading/error/data flags,
// so impossible combinations (e.g. loading with an error) can't happen.
type ProjectsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; projects: ProjectWithTasks[] }

export default function ProjectsPage() {
  const [state, setState] = useState<ProjectsState>({ status: 'loading' })
  const [reloadKey, setReloadKey] = useState(0)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    // Ignore the response if the component unmounted or a newer request started.
    let ignore = false
    getProjects()
      .then((projects) => {
        if (!ignore) setState({ status: 'ready', projects })
      })
      .catch((err) => {
        if (!ignore) setState({ status: 'error', message: getErrorMessage(err) })
      })
    return () => {
      ignore = true
    }
  }, [reloadKey])

  function retry() {
    setState({ status: 'loading' })
    setReloadKey((key) => key + 1)
  }

  // A new project has no tasks yet; add it locally instead of refetching the list.
  function handleCreated(project: Project) {
    setState((current) =>
      current.status === 'ready'
        ? { status: 'ready', projects: [{ ...project, tasks: [] }, ...current.projects] }
        : current,
    )
    setIsCreating(false)
  }

  const newProjectButton = (
    <button type="button" onClick={() => setIsCreating(true)} className={primaryButtonClass}>
      <PlusIcon />
      New project
    </button>
  )

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className={`mt-1 text-sm ${mutedTextClass}`}>Pick a project to see and manage its tasks.</p>
        </div>
        {newProjectButton}
      </div>

      {isCreating && (
        <Modal title="New project" onClose={() => setIsCreating(false)}>
          <CreateProjectForm onCreated={handleCreated} onCancel={() => setIsCreating(false)} />
        </Modal>
      )}

      {state.status === 'loading' && (
        <div className="space-y-4">
          <WakingUpNotice active />
          <SkeletonList count={4} label="Loading projects…" className="grid gap-4 sm:grid-cols-2" />
        </div>
      )}

      {state.status === 'error' && (
        <div className="space-y-3">
          <ErrorAlert message={state.message} />
          <button type="button" onClick={retry} className={secondaryButtonClass}>
            Try again
          </button>
        </div>
      )}

      {state.status === 'ready' && state.projects.length === 0 && (
        <EmptyState
          icon={<FolderIcon className="size-6" />}
          title="No projects yet"
          description="Projects group related tasks. Create your first one to get started."
          action={newProjectButton}
        />
      )}

      {state.status === 'ready' && state.projects.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {state.projects.map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function ProjectCard({ project }: { project: ProjectWithTasks }) {
  const total = project.tasks.length
  const done = project.tasks.filter((task) => task.status === 'DONE').length
  const percentDone = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <Link
      to={`/projects/${project.id}`}
      className={`group flex h-full flex-col ${cardClass} p-5 transition hover:border-indigo-300 hover:shadow-md dark:hover:border-indigo-500/50 ${focusRing}`}
    >
      <h2 className="font-semibold tracking-tight group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
        {project.name}
      </h2>
      <p className={`mt-1 line-clamp-2 text-sm ${mutedTextClass}`}>
        {project.description ?? <span className="italic">No description</span>}
      </p>

      {/* mt-auto pins the progress to the bottom so cards in a row line up. */}
      <div className="mt-auto pt-4">
        <p className={`text-xs ${mutedTextClass}`}>
          {total === 0 ? 'No tasks yet' : `${done} of ${total} tasks done`}
        </p>
        {/* Decorative: the text above already says the same thing. */}
        <div aria-hidden="true" className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-600 dark:bg-indigo-400"
            style={{ width: `${percentDone}%` }}
          />
        </div>
      </div>
    </Link>
  )
}
