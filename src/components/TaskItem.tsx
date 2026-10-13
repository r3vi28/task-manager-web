import { useState } from 'react'
import { getErrorMessage } from '../api/client'
import { deleteTask, updateTask, type TaskFields } from '../api/tasks'
import { formatDueDate } from '../dates'
import { cardClass, ghostButtonClass, mutedTextClass } from '../styles'
import type { Task, TaskPriority } from '../types'
import { PriorityBadge, StatusBadge } from './Badges'
import ErrorAlert from './ErrorAlert'
import { CalendarIcon, CheckIcon, PencilIcon, TrashIcon } from './icons'
import Modal from './Modal'
import TaskForm from './TaskForm'

// Colored left edge so priority can be scanned down the list at a glance.
// The dark: copies are needed because the card's dark border color would override them.
const PRIORITY_STRIPE: Record<TaskPriority, string> = {
  LOW: 'border-l-slate-300 dark:border-l-slate-600',
  MEDIUM: 'border-l-amber-400 dark:border-l-amber-400',
  HIGH: 'border-l-red-500 dark:border-l-red-500',
}

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

  // If updateTask throws, the modal stays open and TaskForm shows the error.
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

  const isDone = task.status === 'DONE'

  return (
    <article className={`${cardClass} border-l-4 p-4 sm:p-5 ${PRIORITY_STRIPE[task.priority]}`}>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <h3
          className={`font-medium ${isDone ? 'text-slate-500 line-through dark:text-slate-400' : ''}`}
        >
          {task.title}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>
      </div>

      {task.description && <p className={`mt-1.5 text-sm ${mutedTextClass}`}>{task.description}</p>}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        {task.dueDate ? (
          <p className={`inline-flex items-center gap-1.5 text-sm ${mutedTextClass}`}>
            <CalendarIcon />
            Due {formatDueDate(task.dueDate)}
          </p>
        ) : (
          <span />
        )}

        <div className="-mr-2 flex flex-wrap gap-1">
          {!isDone && (
            <button
              type="button"
              onClick={markAsDone}
              disabled={isBusy}
              className={`${ghostButtonClass} text-green-700 dark:text-green-400`}
            >
              <CheckIcon />
              Mark as done
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            disabled={isBusy}
            className={`${ghostButtonClass} text-slate-700 dark:text-slate-300`}
          >
            <PencilIcon />
            Edit
          </button>
          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isBusy}
              className={`${ghostButtonClass} text-red-700 dark:text-red-400`}
            >
              <TrashIcon />
              Delete
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3">
          <ErrorAlert message={error} />
        </div>
      )}

      {isEditing && (
        <Modal title="Edit task" onClose={() => setIsEditing(false)}>
          <TaskForm
            task={task}
            submitLabel="Save changes"
            onSubmit={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        </Modal>
      )}
    </article>
  )
}
