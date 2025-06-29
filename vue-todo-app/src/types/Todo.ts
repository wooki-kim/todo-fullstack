export interface Todo {
  id: string
  text: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  createdAt: Date
  updatedAt: Date
}

export type TodoFilter = 'all' | 'active' | 'completed'