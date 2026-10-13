import type { TaskPriority, TaskStatus } from './types'

export const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE']
export const PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH']

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
}

export function isTaskStatus(value: string | null): value is TaskStatus {
  return STATUSES.includes(value as TaskStatus)
}
