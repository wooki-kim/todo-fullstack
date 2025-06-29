import axios from 'axios'
import type { Todo, TodoFilter } from '@/types/Todo'

const API_BASE_URL = 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export interface CreateTodoRequest {
  text: string
  priority?: 'high' | 'medium' | 'low'
}

export interface UpdateTodoRequest {
  text?: string
  completed?: boolean
  priority?: 'high' | 'medium' | 'low'
}

export interface TodoStats {
  total: number
  completed: number
  active: number
}

export const todoApi = {
  async getAllTodos(filter: TodoFilter = 'all'): Promise<Todo[]> {
    const response = await api.get('/todos', {
      params: filter !== 'all' ? { filter } : {}
    })
    return response.data.map((todo: any) => ({
      ...todo,
      createdAt: new Date(todo.createdAt),
      updatedAt: new Date(todo.updatedAt)
    }))
  },

  async getTodo(id: string): Promise<Todo> {
    const response = await api.get(`/todos/${id}`)
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt)
    }
  },

  async createTodo(todo: CreateTodoRequest): Promise<Todo> {
    const response = await api.post('/todos', todo)
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt)
    }
  },

  async updateTodo(id: string, todo: UpdateTodoRequest): Promise<Todo> {
    console.log('API updateTodo called:', { id, todo })
    const response = await api.patch(`/todos/${id}`, todo)
    console.log('API updateTodo response:', response.data)
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt)
    }
  },

  async deleteTodo(id: string): Promise<void> {
    await api.delete(`/todos/${id}`)
  },

  async clearCompleted(): Promise<void> {
    await api.delete('/todos', {
      params: { type: 'completed' }
    })
  },

  async clearAll(): Promise<void> {
    await api.delete('/todos', {
      params: { type: 'all' }
    })
  },

  async toggleAllTodos(): Promise<Todo[]> {
    const response = await api.patch('/todos')
    return response.data.map((todo: any) => ({
      ...todo,
      createdAt: new Date(todo.createdAt),
      updatedAt: new Date(todo.updatedAt)
    }))
  },

  async getStats(): Promise<TodoStats> {
    const response = await api.get('/todos/stats')
    return response.data
  }
}