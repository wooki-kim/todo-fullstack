import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTodos } from '../useTodos'

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

let idCounter = 0
vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => `test-uuid-${++idCounter}`)
})

describe('useTodos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    idCounter = 0
  })

  it('새로운 할 일을 추가할 수 있다', () => {
    const { todos, addTodo } = useTodos()
    
    addTodo('새로운 할 일')
    
    expect(todos.value).toHaveLength(1)
    expect(todos.value[0].text).toBe('새로운 할 일')
    expect(todos.value[0].completed).toBe(false)
    expect(todos.value[0].id).toBe('test-uuid-1')
  })

  it('빈 텍스트는 추가되지 않는다', () => {
    const { todos, addTodo } = useTodos()
    
    addTodo('')
    addTodo('   ')
    
    expect(todos.value).toHaveLength(0)
  })

  it('할 일을 완료 상태로 토글할 수 있다', () => {
    const { todos, addTodo, toggleTodo } = useTodos()
    
    addTodo('테스트 할 일')
    const todoId = todos.value[0].id
    
    expect(todos.value[0].completed).toBe(false)
    
    toggleTodo(todoId)
    
    expect(todos.value[0].completed).toBe(true)
    
    toggleTodo(todoId)
    
    expect(todos.value[0].completed).toBe(false)
  })

  it('할 일을 삭제할 수 있다', () => {
    const { todos, addTodo, removeTodo } = useTodos()
    
    addTodo('삭제할 할 일')
    const todoId = todos.value[0].id
    
    expect(todos.value).toHaveLength(1)
    
    removeTodo(todoId)
    
    expect(todos.value).toHaveLength(0)
  })

  it('할 일 텍스트를 수정할 수 있다', () => {
    const { todos, addTodo, updateTodo } = useTodos()
    
    addTodo('원래 텍스트')
    const todoId = todos.value[0].id
    
    updateTodo(todoId, '수정된 텍스트')
    
    expect(todos.value[0].text).toBe('수정된 텍스트')
  })

  it('완료된 할 일들을 모두 삭제할 수 있다', () => {
    const { todos, addTodo, toggleTodo, clearCompleted, filter } = useTodos()
    
    filter.value = 'all'
    
    addTodo('할 일 1')
    addTodo('할 일 2')
    addTodo('할 일 3')
    
    toggleTodo(todos.value[0].id)
    toggleTodo(todos.value[2].id)
    
    expect(todos.value).toHaveLength(3)
    
    clearCompleted()
    
    expect(todos.value).toHaveLength(1)
    expect(todos.value[0].text).toBe('할 일 2')
  })

  it('모든 할 일을 한번에 토글할 수 있다', () => {
    const { todos, addTodo, toggleAllTodos } = useTodos()
    
    addTodo('할 일 1')
    addTodo('할 일 2')
    addTodo('할 일 3')
    
    toggleAllTodos()
    
    expect(todos.value.every(todo => todo.completed)).toBe(true)
    
    toggleAllTodos()
    
    expect(todos.value.every(todo => !todo.completed)).toBe(true)
  })

  it('필터가 올바르게 작동한다', () => {
    const { todos, filter, addTodo, toggleTodo } = useTodos()
    
    filter.value = 'all'
    
    addTodo('활성 할 일')
    addTodo('완료될 할 일')
    
    const allTodos = todos.value
    toggleTodo(allTodos[1].id)
    
    filter.value = 'active'
    expect(todos.value).toHaveLength(1)
    expect(todos.value[0].text).toBe('활성 할 일')
    
    filter.value = 'completed'
    expect(todos.value).toHaveLength(1)
    expect(todos.value[0].text).toBe('완료될 할 일')
    
    filter.value = 'all'
    expect(todos.value).toHaveLength(2)
  })

  it('통계가 올바르게 계산된다', () => {
    const { addTodo, toggleTodo, todoStats, todos, filter } = useTodos()
    
    filter.value = 'all'
    
    addTodo('할 일 1')
    addTodo('할 일 2')
    addTodo('할 일 3')
    
    expect(todoStats.value.total).toBe(3)
    expect(todoStats.value.active).toBe(3)
    expect(todoStats.value.completed).toBe(0)
    
    const allTodos = todos.value
    toggleTodo(allTodos[0].id)
    toggleTodo(allTodos[1].id)
    
    expect(todoStats.value.total).toBe(3)
    expect(todoStats.value.active).toBe(1)
    expect(todoStats.value.completed).toBe(2)
  })
})