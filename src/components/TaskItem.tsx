import { useState } from 'react'
import { getErrorMessage } from '../api/client'
import { deleteTask, updateTask, type TaskFields } from '../api/tasks'
import { formatDueDate } from '../dates'
import { PRIORITY_LABELS, STATUS_LABELS } from '../labels'
import type { Task, TaskPriority, TaskStatus } from '../types'
import ErrorAlert from './ErrorAlert'
import TaskForm from './TaskForm'

const STATUS_BADGE: Record<TaskStatus, string> = {
  TODO: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  DONE: 'bg-green-100 text-green-800',
}

const PRIORITY_BADGE: Record<TaskPriority, string> = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-amber-100 text-amber-800',
  HIGH: 'bg-red-100 text-red-800',
}

const actionClass =
  'rounded px-2 py-1 text-sm font-medium hover:bg-slate-100 disabled:opacity-60'

interface TaskItemProps {
  task: Task
  canDelete: boolean
  onUpdated: (task: Task) => void
  onDeleted: (taskId: number) => void
}

export default function TaskItem({ task, canDelete, onUpdated, onDeleted }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(fields: TaskFields) {
    onUpdated(await updateTask(task.id, fields))
    setIsEditing(false)
  }

  async function runAction(action: () => Promise<void>) {
    setIsBusy(true)
    setError(null)
    try {
      await action()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsBusy(false)
    }
  }

  function markAsDone() {
    // Priority must be sent too, or the API resets it to MEDIUM.
    runAction(async () => {
      onUpdated(await updateTask(task.id, { status: 'DONE', priority: task.priority }))
    })
  }

  function handleDelete() {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return
    runAction(async () => {
      await deleteTask(task.id)
      onDeleted(task.id)
    })
  }

  if (isEditing) {
    return (
      <TaskForm
        task={task}
        submitLabel="Save changes"
        onSubmit={handleSave}
        onCancel={() => setIsEditing(false)}
      />
    )
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className={`font-semibold ${task.status === 'DONE' ? 'text-slate-500 line-through' : ''}`}>
          {task.title}
        </h3>
        <div className="flex gap-2 text-xs font-medium">
          <span className={`rounded px-2 py-0.5 ${STATUS_BADGE[task.status]}`}>
            {STATUS_LABELS[task.status]}
          </span>
          <span className={`rounded px-2 py-0.5 ${PRIORITY_BADGE[task.priority]}`}>
            {PRIORITY_LABELS[task.priority]} priority
          </span>
        </div>
      </div>

      {task.description && <p className="mt-1 text-sm text-slate-600">{task.description}</p>}
      {task.dueDate && (
        <p className="mt-2 text-sm text-slate-500">Due {formatDueDate(task.dueDate)}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-1">
        {task.status !== 'DONE' && (
          <button
            type="button"
            onClick={markAsDone}
            disabled={isBusy}
            className={`${actionClass} text-green-700`}
          >
            Mark as done
          </button>
        )}
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          disabled={isBusy}
          className={`${actionClass} text-slate-700`}
        >
          Edit
        </button>
        {canDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isBusy}
            className={`${actionClass} text-red-700`}
          >
            Delete
          </button>
        )}
      </div>

      {error && (
        <div className="mt-3">
          <ErrorAlert message={error} />
        </div>
      )}
    </article>
  )
}
