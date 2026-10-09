import type { Project, ProjectWithTasks } from '../types'
import { apiRequest } from './client'

export interface NewProject {
  name: string
  description?: string
}

export function getProjects() {
  return apiRequest<ProjectWithTasks[]>('/api/projects')
}

export function createProject(project: NewProject) {
  return apiRequest<Project>('/api/projects', { method: 'POST', body: project })
}
