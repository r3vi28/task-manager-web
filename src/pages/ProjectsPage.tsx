import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getErrorMessage } from '../api/client'
import { getProjects } from '../api/projects'
import CreateProjectForm from '../components/CreateProjectForm'
import ErrorAlert from '../components/ErrorAlert'
import WakingUpNotice from '../components/WakingUpNotice'
import { secondaryButtonClass } from '../styles'
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
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Projects</h1>

      <CreateProjectForm onCreated={handleCreated} />

      {state.status === 'loading' && (
        <div className="space-y-3">
          <p className="text-slate-600">Loading projects…</p>
          <WakingUpNotice active />
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
        <p className="text-slate-600">No projects yet. Create your first one above.</p>
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

  return (
    <Link
      to={`/projects/${project.id}`}
      className="block h-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-300 hover:shadow"
    >
      <h2 className="font-semibold">{project.name}</h2>
      <p className="mt-1 text-sm text-slate-600">
        {project.description ?? <span className="italic">No description</span>}
      </p>
      <p className="mt-3 text-sm text-slate-500">
        {total === 0 ? 'No tasks yet' : `${done} of ${total} tasks done`}
      </p>
    </Link>
  )
}
