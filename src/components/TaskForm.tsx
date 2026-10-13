import { useState, type SubmitEvent } from 'react'
import { ApiError, getErrorMessage, type FieldErrors } from '../api/client'
import type { TaskFields } from '../api/tasks'
import { toApiDate, toDateInputValue } from '../dates'
import { PRIORITIES, PRIORITY_LABELS, STATUSES, STATUS_LABELS } from '../labels'
import {
  inputClass,
  labelClass,
  optionalHintClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../styles'
import type { Task, TaskPriority, TaskStatus } from '../types'
import ErrorAlert from './ErrorAlert'
import FieldError from './FieldError'
import WakingUpNotice from './WakingUpNotice'

interface TaskFormProps {
  task?: Task // when present, the form edits this task
  submitLabel: string
  onSubmit: (fields: TaskFields) => Promise<void>
  onCancel: () => void
}

// Shared by "create" and "edit". The parent decides which API call to make
// and closes the modal on success; if onSubmit throws, the form shows the error.
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
    } catch (err) {
      setError(getErrorMessage(err))
      if (err instanceof ApiError) setFieldErrors(err.fieldErrors)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className={labelClass}>
        Title
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
        <FieldError messages={fieldErrors.title} />
      </label>

      <label className={labelClass}>
        Description <span className={optionalHintClass}>(optional)</span>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />
        <FieldError messages={fieldErrors.description} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
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

        <label className={labelClass}>
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

        <label className={`${labelClass} sm:col-span-2`}>
          Due date <span className={optionalHintClass}>(optional)</span>
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

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className={secondaryButtonClass}>
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
