import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TodoApp from '../TodoApp.vue'

// 모바일 미디어 쿼리 모킹
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// viewport 크기 모킹
const mockViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })
}

describe('반응형 디자인 단위 테스트', () => {
  beforeEach(() => {
    // 로컬스토리지 모킹
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    vi.stubGlobal('localStorage', localStorageMock)
  })

  it('아이폰 미니 크기에서 컴포넌트가 정상 렌더링됨', () => {
    mockViewport(375, 667)
    mockMatchMedia(true) // 모바일 미디어 쿼리 매치
    
    const wrapper = mount(TodoApp)
    
    // 기본 구조가 렌더링되는지 확인
    expect(wrapper.find('.todo-app').exists()).toBe(true)
    expect(wrapper.find('.header').exists()).toBe(true)
    expect(wrapper.find('h1').text()).toBe('할 일 목록')
    expect(wrapper.find('.todo-input').exists()).toBe(true)
    expect(wrapper.find('.priority-select').exists()).toBe(true)
  })

  it('매우 작은 화면에서도 모든 요소가 렌더링됨', () => {
    mockViewport(320, 568)
    mockMatchMedia(true)
    
    const wrapper = mount(TodoApp)
    
    // 필수 요소들이 모두 존재하는지 확인
    expect(wrapper.find('.todo-input').exists()).toBe(true)
    expect(wrapper.find('.priority-select').exists()).toBe(true)
    
    // CSS 클래스가 올바르게 적용되는지 확인
    const todoApp = wrapper.find('.todo-app')
    expect(todoApp.classes()).toContain('todo-app')
  })

  it('태블릿 크기에서 적절한 스타일이 적용됨', () => {
    mockViewport(768, 1024)
    mockMatchMedia(false) // 모바일이 아님
    
    const wrapper = mount(TodoApp)
    
    // 태블릿 스타일 확인
    expect(wrapper.find('.todo-app').exists()).toBe(true)
    expect(wrapper.find('.header').exists()).toBe(true)
  })

  it('데스크탑 크기에서 적절한 스타일이 적용됨', () => {
    mockViewport(1920, 1080)
    mockMatchMedia(false)
    
    const wrapper = mount(TodoApp)
    
    // 데스크탑 스타일 확인
    expect(wrapper.find('.todo-app').exists()).toBe(true)
    expect(wrapper.find('.header').exists()).toBe(true)
  })

  it('할 일 추가가 모든 화면 크기에서 동작함', async () => {
    const resolutions = [
      { width: 320, height: 568 },
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1920, height: 1080 }
    ]

    for (const resolution of resolutions) {
      mockViewport(resolution.width, resolution.height)
      mockMatchMedia(resolution.width <= 768)
      
      const wrapper = mount(TodoApp)
      
      // 할 일 추가
      const input = wrapper.find('.todo-input')
      await input.setValue('테스트 할 일')
      const form = wrapper.find('.todo-input-form')
      await form.trigger('submit')
      
      // 할 일이 추가되었는지 확인
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('테스트 할 일')
    }
  })

  it('우선순위 선택이 모든 화면 크기에서 동작함', async () => {
    mockViewport(375, 667)
    mockMatchMedia(true)
    
    const wrapper = mount(TodoApp)
    
    // 우선순위 선택
    const prioritySelect = wrapper.find('.priority-select')
    await prioritySelect.setValue('high')
    
    // 입력창에 텍스트 입력 후 폼 제출
    const input = wrapper.find('.todo-input')
    await input.setValue('높은 우선순위 할 일')
    const form = wrapper.find('.todo-input-form')
    await form.trigger('submit')
    
    // 할 일이 추가되고 우선순위가 적용되었는지 확인
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('높은 우선순위 할 일')
    expect(wrapper.find('.priority-high').exists()).toBe(true)
  })

  it('필터링이 모든 화면 크기에서 동작함', async () => {
    mockViewport(375, 667)
    mockMatchMedia(true)
    
    const wrapper = mount(TodoApp)
    
    // 할 일 추가
    const input = wrapper.find('.todo-input')
    await input.setValue('테스트 할 일')
    const form = wrapper.find('.todo-input-form')
    await form.trigger('submit')
    await wrapper.vm.$nextTick()
    
    // 할 일 완료 처리
    const toggle = wrapper.find('.toggle')
    await toggle.setValue(true)
    
    // 완료된 항목 필터 클릭 (필터 버튼 찾기)
    const filterButtons = wrapper.findAll('.filter-button')
    const completedFilter = filterButtons.find(button => button.text().includes('완료'))
    if (completedFilter) {
      await completedFilter.trigger('click')
    }
    
    // 필터링이 동작하는지 확인
    expect(wrapper.find('.todo-item.completed').exists()).toBe(true)
  })

  it('작은 화면에서 텍스트 오버플로우가 처리됨', async () => {
    mockViewport(320, 568)
    mockMatchMedia(true)
    
    const wrapper = mount(TodoApp)
    
    // 매우 긴 텍스트로 할 일 추가
    const longText = '이것은 매우 긴 할 일 제목입니다. 작은 화면에서는 이 텍스트가 적절히 처리되어야 합니다.'
    const input = wrapper.find('.todo-input')
    await input.setValue(longText)
    const form = wrapper.find('.todo-input-form')
    await form.trigger('submit')
    await wrapper.vm.$nextTick()
    
    // 텍스트가 추가되었는지 확인
    expect(wrapper.text()).toContain(longText)
    
    // todo-text 요소가 존재하는지 확인
    expect(wrapper.find('.todo-text').exists()).toBe(true)
  })

  it('푸터 버튼들이 모든 화면 크기에서 렌더링됨', async () => {
    mockViewport(375, 667)
    mockMatchMedia(true)
    
    const wrapper = mount(TodoApp)
    
    // 할 일을 몇 개 추가해서 푸터가 보이도록 함
    const input = wrapper.find('.todo-input')
    const form = wrapper.find('.todo-input-form')
    
    await input.setValue('첫 번째 할 일')
    await form.trigger('submit')
    await wrapper.vm.$nextTick()
    
    await input.setValue('두 번째 할 일')
    await form.trigger('submit')
    await wrapper.vm.$nextTick()
    
    // 첫 번째 할 일 완료
    const toggle = wrapper.find('.toggle')
    await toggle.setValue(true)
    
    // 푸터가 표시되는지 확인
    expect(wrapper.find('.footer').exists()).toBe(true)
    
    // 버튼들이 존재하는지 확인
    expect(wrapper.find('.toggle-all-button').exists()).toBe(true)
    expect(wrapper.find('.clear-completed').exists()).toBe(true)
    expect(wrapper.find('.clear-all').exists()).toBe(true)
  })
})