import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { Todo, TodoFilter } from '@/types/Todo'
import { todoApi } from '@/services/api'
import { socketService } from '@/services/socket'

export function useTodos() {
  const allTodos = ref<Todo[]>([])
  const filter = ref<TodoFilter>('all')
  const loading = ref(false)
  const error = ref<string | null>(null)
  const editingTodos = ref<Map<string, { userId: string; text?: string }>>(new Map())

  const loadTodos = async (filterType?: TodoFilter) => {
    try {
      loading.value = true
      error.value = null
      const currentFilter = filterType || filter.value
      allTodos.value = await todoApi.getAllTodos(currentFilter)
      await loadStats()
    } catch (err) {
      error.value = '할 일을 불러오는데 실패했습니다.'
      console.error('Failed to load todos:', err)
    } finally {
      loading.value = false
    }
  }

  const addTodo = async (text: string, priority: 'high' | 'medium' | 'low' = 'medium') => {
    if (!text.trim()) return

    try {
      loading.value = true
      error.value = null
      await todoApi.createTodo({ text: text.trim(), priority })
      // WebSocket으로 실시간 업데이트되므로 로컬 상태는 업데이트하지 않음
    } catch (err) {
      error.value = '할 일 추가에 실패했습니다.'
      console.error('Failed to add todo:', err)
    } finally {
      loading.value = false
    }
  }

  const removeTodo = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      await todoApi.deleteTodo(id)
      // WebSocket으로 실시간 업데이트되므로 로컬 상태는 업데이트하지 않음
    } catch (err) {
      error.value = '할 일 삭제에 실패했습니다.'
      console.error('Failed to remove todo:', err)
    } finally {
      loading.value = false
    }
  }

  const toggleTodo = async (id: string) => {
    const todo = allTodos.value.find(todo => todo.id === id)
    if (!todo) return

    try {
      loading.value = true
      error.value = null
      await todoApi.updateTodo(id, { completed: !todo.completed })
      // WebSocket으로 실시간 업데이트되므로 로컬 상태는 업데이트하지 않음
    } catch (err) {
      error.value = '할 일 상태 변경에 실패했습니다.'
      console.error('Failed to toggle todo:', err)
    } finally {
      loading.value = false
    }
  }

  const updateTodo = async (id: string, updates: { text?: string; priority?: 'high' | 'medium' | 'low' }) => {
    console.log('useTodos updateTodo called with:', { id, updates })
    if (updates.text !== undefined && !updates.text.trim()) return

    try {
      loading.value = true
      error.value = null
      
      const updateData: any = {}
      if (updates.text !== undefined) {
        updateData.text = updates.text.trim()
      }
      if (updates.priority !== undefined) {
        updateData.priority = updates.priority
      }
      
      console.log('Sending API request:', { id, updateData })
      await todoApi.updateTodo(id, updateData)
      // WebSocket으로 실시간 업데이트되므로 로컬 상태는 업데이트하지 않음
    } catch (err) {
      error.value = '할 일 수정에 실패했습니다.'
      console.error('Failed to update todo:', err)
    } finally {
      loading.value = false
    }
  }

  const clearCompleted = async () => {
    try {
      loading.value = true
      error.value = null
      await todoApi.clearCompleted()
      // WebSocket으로 실시간 업데이트되므로 로컬 상태는 업데이트하지 않음
    } catch (err) {
      error.value = '완료된 할 일 삭제에 실패했습니다.'
      console.error('Failed to clear completed todos:', err)
    } finally {
      loading.value = false
    }
  }

  const clearAll = async () => {
    try {
      loading.value = true
      error.value = null
      await todoApi.clearAll()
      // WebSocket으로 실시간 업데이트되므로 로컬 상태는 업데이트하지 않음
    } catch (err) {
      error.value = '모든 할 일 삭제에 실패했습니다.'
      console.error('Failed to clear all todos:', err)
    } finally {
      loading.value = false
    }
  }

  const toggleAllTodos = async () => {
    try {
      loading.value = true
      error.value = null
      await todoApi.toggleAllTodos()
      // WebSocket으로 실시간 업데이트되므로 로컬 상태는 업데이트하지 않음
    } catch (err) {
      error.value = '모든 할 일 상태 변경에 실패했습니다.'
      console.error('Failed to toggle all todos:', err)
    } finally {
      loading.value = false
    }
  }

  // DB에서 필터링된 데이터를 받으므로 그대로 반환
  const filteredTodos = computed(() => allTodos.value)

  const todoStats = ref({ total: 0, completed: 0, active: 0 })

  const loadStats = async () => {
    try {
      const stats = await todoApi.getStats()
      todoStats.value = stats
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  const setupSocketListeners = () => {
    socketService.on('todoCreated', (todo: Todo) => {
      // 현재 필터에 맞는 항목인지 확인하고 추가
      const shouldShow = 
        filter.value === 'all' || 
        (filter.value === 'active' && !todo.completed) ||
        (filter.value === 'completed' && todo.completed)
      
      if (shouldShow) {
        const existingIndex = allTodos.value.findIndex(t => t.id === todo.id)
        if (existingIndex === -1) {
          allTodos.value.unshift(todo)
        }
      }
      loadStats()
    })

    socketService.on('todoUpdated', (todo: Todo) => {
      // 현재 필터에 맞는 항목인지 확인
      const shouldShow = 
        filter.value === 'all' || 
        (filter.value === 'active' && !todo.completed) ||
        (filter.value === 'completed' && todo.completed)
      
      const index = allTodos.value.findIndex(t => t.id === todo.id)
      
      if (shouldShow) {
        if (index > -1) {
          allTodos.value[index] = todo
        } else {
          allTodos.value.unshift(todo)
        }
      } else {
        if (index > -1) {
          allTodos.value.splice(index, 1)
        }
      }
      loadStats()
    })

    socketService.on('todoDeleted', (todoId: string) => {
      const index = allTodos.value.findIndex(t => t.id === todoId)
      if (index > -1) {
        allTodos.value.splice(index, 1)
      }
      loadStats()
    })

    socketService.on('todosBulkUpdated', () => {
      loadTodos()
    })

    socketService.on('todosBulkDeleted', () => {
      loadTodos()
    })

    socketService.on('todoEditStart', (data: { todoId: string; userId: string }) => {
      editingTodos.value.set(data.todoId, { userId: data.userId })
    })

    socketService.on('todoEditEnd', (data: { todoId: string; userId: string }) => {
      editingTodos.value.delete(data.todoId)
    })

    socketService.on('todoEditChange', (data: { todoId: string; text: string; userId: string }) => {
      const editing = editingTodos.value.get(data.todoId)
      if (editing && editing.userId === data.userId) {
        editingTodos.value.set(data.todoId, { userId: data.userId, text: data.text })
      }
    })
  }

  const startEditing = (todoId: string) => {
    socketService.emitStartEdit(todoId)
  }

  const endEditing = (todoId: string) => {
    socketService.emitEndEdit(todoId)
  }

  const emitEditChange = (todoId: string, text: string) => {
    socketService.emitEditChange(todoId, text)
  }

  const isBeingEdited = (todoId: string) => {
    return editingTodos.value.has(todoId)
  }

  const getEditingText = (todoId: string) => {
    return editingTodos.value.get(todoId)?.text
  }

  const getEditingUserId = (todoId: string) => {
    return editingTodos.value.get(todoId)?.userId
  }

  const removeSocketListeners = () => {
    socketService.off('todoCreated', () => {})
    socketService.off('todoUpdated', () => {})
    socketService.off('todoDeleted', () => {})
    socketService.off('todosBulkUpdated', () => {})
    socketService.off('todosBulkDeleted', () => {})
    socketService.off('todoEditStart', () => {})
    socketService.off('todoEditEnd', () => {})
    socketService.off('todoEditChange', () => {})
  }

  // 필터 변경 시 데이터 다시 로드
  watch(filter, (newFilter) => {
    loadTodos(newFilter)
  })

  onMounted(() => {
    loadTodos()
    socketService.connect()
    setupSocketListeners()
  })

  onUnmounted(() => {
    removeSocketListeners()
    socketService.disconnect()
  })

  return {
    todos: filteredTodos,
    filter,
    loading,
    error,
    addTodo,
    removeTodo,
    toggleTodo,
    updateTodo,
    clearCompleted,
    clearAll,
    toggleAllTodos,
    todoStats,
    loadTodos,
    startEditing,
    endEditing,
    emitEditChange,
    isBeingEdited,
    getEditingText,
    getEditingUserId
  }
}