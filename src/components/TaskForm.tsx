import { useState, type SubmitEvent } from 'react'
import { ApiError, getErrorMessage, type FieldErrors } from '../api/client'
import type { TaskFields } from '../api/tasks'
import { toApiDate, toDateInputValue } from '../dates'
import { PRIORITIES, PRIORITY_LABELS, STATUSES, STATUS_LABELS } from '../labels'
import { inputClass, primaryButtonClass, secondaryButtonClass } from '../styles'
import type { Task, TaskPriority, TaskStatus } from '../types'
import ErrorAlert from './ErrorAlert'
import FieldError from './FieldError'
import WakingUpNotice from './WakingUpNotice'

interface TaskFormProps {
  task?: Task // when present, the form edits this task
  submitLabel: string
  onSubmit: (fields: TaskFields) => Promise<void>
  onCancel?: () => void
}

// Shared by "create" and "edit". The parent decides which API call to make.
export default function TaskForm({ task, submitLabel, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'TODO')
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'MEDIUM')
  const [dueDate, setDueDate] = useState(toDateInputValue(task?.dueDate ?? null))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setFieldErrors({})

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        dueDate: toApiDate(dueDate),
      })
      if (!task) {
        setTitle('')
        setDescription('')
        setStatus('TODO')
        setPriority('MEDIUM')
        setDueDate('')
      }
    } catch (err) {
      setError(getErrorMessage(err))
      if (err instanceof ApiError) setFieldErrors(err.fieldErrors)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <label className="block text-sm font-medium">
        Title
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
        <FieldError messages={fieldErrors.title} />
      </label>

      <label className="block text-sm font-medium">
        Description <span className="font-normal text-slate-500">(optional)</span>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />
        <FieldError messages={fieldErrors.description} />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm font-medium">
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className={inputClass}
          >
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>
          <FieldError messages={fieldErrors.status} />
        </label>

        <label className="block text-sm font-medium">
          Priority
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className={inputClass}
          >
            {PRIORITIES.map((value) => (
              <option key={value} value={value}>
                {PRIORITY_LABELS[value]}
              </option>
            ))}
          </select>
          <FieldError messages={fieldErrors.priority} />
        </label>

        <label className="block text-sm font-medium">
          Due date <span className="font-normal text-slate-500">(optional)</span>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClass}
          />
          <FieldError messages={fieldErrors.dueDate} />
        </label>
      </div>

      <ErrorAlert message={error} />
      <WakingUpNotice active={isSubmitting} />

      <div className="flex gap-2">
        <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className={secondaryButtonClass}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
