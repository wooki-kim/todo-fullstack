<template>
  <form @submit.prevent="handleSubmit" class="todo-input-form">
    <div class="input-row">
      <input
        ref="inputRef"
        type="text"
        class="todo-input"
        placeholder="할 일을 입력하세요..."
        autofocus
      />
      <select v-model="priority" class="priority-select" :data-priority="priority">
        <option value="high">● 높음</option>
        <option value="medium">● 중간</option>
        <option value="low">● 낮음</option>
      </select>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const emit = defineEmits<{
  addTodo: [text: string, priority: 'high' | 'medium' | 'low']
}>()

const priority = ref<'high' | 'medium' | 'low'>('medium')
const inputRef = ref<HTMLInputElement>()

// Firefox detection
const isFirefox = navigator.userAgent.toLowerCase().includes('firefox')

onMounted(() => {
  if (isFirefox && inputRef.value) {
    // Firefox specific optimizations
    inputRef.value.style.willChange = 'auto'
    inputRef.value.style.contain = 'style layout'
    inputRef.value.addEventListener('input', (e) => {
      e.stopPropagation()
    }, { passive: true })
  }
})

const handleSubmit = () => {
  const inputValue = inputRef.value?.value || ''
  if (inputValue.trim()) {
    emit('addTodo', inputValue, priority.value)
    if (inputRef.value) {
      inputRef.value.value = ''
    }
    priority.value = 'medium'
  }
}
</script>

<style scoped>
.todo-input-form {
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  margin-bottom: 1.5rem;
  overflow: hidden;
  border: 2px solid #f1f5f9;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  contain: layout style;
}

.input-row {
  display: flex;
  align-items: center;
  position: relative;
  min-height: 54px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.todo-input-form:focus-within {
  border-color: #3b82f6;
}

.todo-input {
  flex: 1;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 1rem;
  font-weight: 400;
  padding: 16px 16px 16px 48px;
  border: none;
  background: transparent;
  outline: none;
  color: #374151;
  line-height: 1.5;
  height: 54px;
  box-sizing: border-box;
  will-change: contents;
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Firefox specific fixes */
@-moz-document url-prefix() {
  .todo-input {
    will-change: auto;
    transform: none;
    contain: style layout;
    isolation: isolate;
  }
  
  .todo-input-form {
    contain: layout style paint;
    transform: translateZ(0);
  }
}

.priority-select {
  font-size: 0.8rem;
  padding: 6px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #f9fafb;
  color: #374151;
  margin-right: 8px;
  outline: none;
  cursor: pointer;
  flex-shrink: 0;
  min-width: 65px;
  max-width: 80px;
  height: 32px;
  font-weight: 500;
  box-sizing: border-box;
}

.priority-select[data-priority="high"] {
  color: #dc2626;
}

.priority-select[data-priority="medium"] {
  color: #ea580c;
}

.priority-select[data-priority="low"] {
  color: #16a34a;
}

.priority-select option[value="high"] {
  color: #dc2626;
  font-weight: 600;
}

.priority-select option[value="medium"] {
  color: #ea580c;
  font-weight: 600;
}

.priority-select option[value="low"] {
  color: #16a34a;
  font-weight: 600;
}

.todo-input::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.todo-input-form::before {
  content: '✍️';
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
  z-index: 1;
  pointer-events: none;
}

/* iPhone 12 Mini and small devices */
@media (max-width: 390px) {
  .todo-input-form {
    border-radius: 12px;
    margin-bottom: 1rem;
    width: 100%;
    max-width: 100%;
    border-width: 2px;
  }
  
  .input-row {
    min-height: 48px;
    padding: 0;
  }
  
  .todo-input {
    font-size: 0.9rem;
    padding: 14px 16px 14px 40px;
    height: 48px;
    min-width: 0;
    width: 100%;
  }
  
  .todo-input-form::before {
    left: 16px;
    font-size: 0.9rem;
  }
  
  .priority-select {
    font-size: 0.75rem;
    padding: 6px 8px;
    min-width: 60px;
    max-width: 75px;
    height: 32px;
    margin-right: 12px;
  }
}

/* Tablet */
@media (min-width: 768px) {
  .todo-input-form {
    border-radius: 16px;
    margin-bottom: 2rem;
  }
  
  .todo-input {
    font-size: 1.125rem;
    padding: 18px 20px 18px 56px;
  }
  
  .todo-input-form::before {
    left: 20px;
    font-size: 1.125rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .todo-input {
    font-size: 1.25rem;
    padding: 20px 24px 20px 64px;
  }
  
  .todo-input-form::before {
    left: 24px;
    font-size: 1.25rem;
  }
}
</style>