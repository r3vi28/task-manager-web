import { useState, type SubmitEvent } from 'react'
import { ApiError, getErrorMessage, type FieldErrors } from '../api/client'
import { createProject } from '../api/projects'
import {
  inputClass,
  labelClass,
  optionalHintClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../styles'
import type { Project } from '../types'
import ErrorAlert from './ErrorAlert'
import FieldError from './FieldError'
import WakingUpNotice from './WakingUpNotice'

interface CreateProjectFormProps {
  onCreated: (project: Project) => void
  onCancel: () => void
}

// Rendered inside a modal: the parent closes it in onCreated.
// On failure nothing is closed and the error stays visible.
export default function CreateProjectForm({ onCreated, onCancel }: CreateProjectFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setFieldErrors({})

    try {
      // Description is optional: omit it instead of sending an empty string.
      const project = await createProject({
        name: name.trim(),
        description: description.trim() || undefined,
      })
      onCreated(project)
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
        Name
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
        <FieldError messages={fieldErrors.name} />
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

      <ErrorAlert message={error} />
      <WakingUpNotice active={isSubmitting} />

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className={secondaryButtonClass}>
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
          {isSubmitting ? 'Creating…' : 'Create project'}
        </button>
      </div>
    </form>
  )
}
