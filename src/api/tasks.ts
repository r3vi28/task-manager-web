import type { ProjectWithTasks, Task, TaskPriority, TaskStatus } from '../types'
import { apiRequest } from './client'

export interface TaskFields {
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string // UTC ISO string, see dates.ts
}

// The API resets status and priority to TODO/MEDIUM when a PUT omits them,
// so the type makes both required and the compiler enforces it.
export type TaskUpdate = Partial<TaskFields> & Pick<TaskFields, 'status' | 'priority'>

export function getProject(projectId: number) {
  return apiRequest<ProjectWithTasks>(`/api/projects/${projectId}`)
}

export function createTask(projectId: number, fields: TaskFields) {
  return apiRequest<Task>(`/api/projects/${projectId}/tasks`, { method: 'POST', body: fields })
}

export function updateTask(taskId: number, fields: TaskUpdate) {
  return apiRequest<Task>(`/api/tasks/${taskId}`, { method: 'PUT', body: fields })
}

export function deleteTask(taskId: number) {
  return apiRequest<void>(`/api/tasks/${taskId}`, { method: 'DELETE' })
}
