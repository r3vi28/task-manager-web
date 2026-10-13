import { PRIORITY_LABELS, STATUS_LABELS } from '../labels'
import type { TaskPriority, TaskStatus } from '../types'

const badgeBase =
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset'

const STATUS_STYLES: Record<TaskStatus, string> = {
  TODO: 'bg-slate-100 text-slate-700 ring-slate-500/20 dark:bg-slate-500/15 dark:text-slate-300',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/15 dark:text-blue-300',
  DONE: 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/15 dark:text-green-300',
}

const PRIORITY_DOT: Record<TaskPriority, string> = {
  LOW: 'bg-slate-400',
  MEDIUM: 'bg-amber-500',
  HIGH: 'bg-red-500',
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <span className={`${badgeBase} ${STATUS_STYLES[status]}`}>{STATUS_LABELS[status]}</span>
}

// Neutral pill with a colored dot: the text carries the meaning, so the color
// never has to meet text contrast and colorblind users lose nothing.
export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={`${badgeBase} bg-white text-slate-700 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${PRIORITY_DOT[priority]}`} />
      {PRIORITY_LABELS[priority]} priority
    </span>
  )
}
