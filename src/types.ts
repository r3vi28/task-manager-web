// Shapes returned by the Task Manager API.

export type Role = 'ADMIN' | 'MEMBER'
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface User {
  id: number
  name: string
  email: string
  role: Role
  createdAt: string
}

export interface Task {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assignedToId: number | null
  projectId: number
  createdAt: string
  dueDate: string | null
}

export interface Project {
  id: number
  name: string
  description: string | null
  ownerId: number
  createdAt: string
}

// GET /api/projects and GET /api/projects/:id include the project's tasks.
export interface ProjectWithTasks extends Project {
  tasks: Task[]
}

export interface LoginResponse {
  token: string
  user: User
}
