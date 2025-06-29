import { io, Socket } from 'socket.io-client'
import type { Todo } from '@/types/Todo'

class SocketService {
  private socket: Socket | null = null
  private listeners: Map<string, Function[]> = new Map()

  connect() {
    if (this.socket?.connected) {
      return
    }

    this.socket = io('http://localhost:3000', {
      transports: ['websocket'],
      autoConnect: true,
    })

    this.socket.on('connect', () => {
      console.log('🔗 WebSocket connected')
    })

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected')
    })

    this.socket.on('todoCreated', (todo: Todo) => {
      this.emit('todoCreated', todo)
    })

    this.socket.on('todoUpdated', (todo: Todo) => {
      this.emit('todoUpdated', todo)
    })

    this.socket.on('todoDeleted', (data: { id: string }) => {
      this.emit('todoDeleted', data.id)
    })

    this.socket.on('todosBulkUpdated', (todos: Todo[]) => {
      this.emit('todosBulkUpdated', todos)
    })

    this.socket.on('todosBulkDeleted', (data: { type: 'completed' | 'all' }) => {
      this.emit('todosBulkDeleted', data.type)
    })

    this.socket.on('todoEditStart', (data: { todoId: string; userId: string }) => {
      this.emit('todoEditStart', data)
    })

    this.socket.on('todoEditEnd', (data: { todoId: string; userId: string }) => {
      this.emit('todoEditEnd', data)
    })

    this.socket.on('todoEditChange', (data: { todoId: string; text: string; userId: string }) => {
      this.emit('todoEditChange', data)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(callback)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, ...args: any[]) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(callback => callback(...args))
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }

  emitStartEdit(todoId: string) {
    if (this.socket) {
      this.socket.emit('startEdit', { todoId })
    }
  }

  emitEndEdit(todoId: string) {
    if (this.socket) {
      this.socket.emit('endEdit', { todoId })
    }
  }

  emitEditChange(todoId: string, text: string) {
    if (this.socket) {
      this.socket.emit('editChange', { todoId, text })
    }
  }
}

export const socketService = new SocketService()