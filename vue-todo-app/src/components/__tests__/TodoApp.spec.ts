import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TodoApp from '../TodoApp.vue'

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid-123'
})

describe('TodoApp', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('렌더링이 올바르게 된다', () => {
    const wrapper = mount(TodoApp)
    expect(wrapper.find('h1').text()).toBe('할 일 목록')
    expect(wrapper.find('.todo-input').exists()).toBe(true)
  })

  it('새로운 할 일을 추가할 수 있다', async () => {
    const wrapper = mount(TodoApp)
    const form = wrapper.find('.todo-input-form')
    const input = wrapper.find('.todo-input')
    
    await input.setValue('새로운 할 일')
    await form.trigger('submit')
    
    expect(wrapper.find('.todo-text').text()).toBe('새로운 할 일')
    expect(localStorageMock.setItem).toHaveBeenCalled()
  })

  it('할 일을 완료 상태로 토글할 수 있다', async () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([{
      id: '1',
      text: '테스트 할 일',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }]))

    const wrapper = mount(TodoApp)
    const checkbox = wrapper.find('.toggle')
    
    await checkbox.setValue(true)
    
    expect(wrapper.find('.todo-item').classes()).toContain('completed')
  })

  it('할 일을 삭제할 수 있다', async () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([{
      id: '1',
      text: '삭제할 할 일',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }]))

    const wrapper = mount(TodoApp)
    const deleteButton = wrapper.find('.destroy')
    
    await deleteButton.trigger('click')
    
    expect(wrapper.find('.todo-item').exists()).toBe(false)
  })

  it('빈 텍스트로는 할 일을 추가할 수 없다', async () => {
    const wrapper = mount(TodoApp)
    const input = wrapper.find('.todo-input')
    
    await input.setValue('   ')
    await input.trigger('keydown.enter')
    
    expect(wrapper.find('.todo-item').exists()).toBe(false)
  })

  it('로컬스토리지에서 할 일 목록을 불러온다', () => {
    const mockTodos = [{
      id: '1',
      text: '저장된 할 일',
      completed: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }]
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTodos))
    
    const wrapper = mount(TodoApp)
    expect(wrapper.find('.todo-text').text()).toBe('저장된 할 일')
    expect(wrapper.find('.todo-item').classes()).toContain('completed')
  })
})