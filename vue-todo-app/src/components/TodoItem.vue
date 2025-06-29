<template>
  <li class="todo-item" :class="{ 
    completed: todo.completed, 
    editing: isEditing, 
    'being-edited': isBeingEdited,
    [`priority-${isEditing ? editPriority : todo.priority}`]: true 
  }">
    <div class="view" v-if="!isEditing">
      <div class="priority-indicator" :class="`priority-${isEditing ? editPriority : todo.priority}`"></div>
      <input
        class="toggle"
        type="checkbox"
        :checked="todo.completed"
        @change="$emit('toggleTodo', todo.id)"
        :disabled="isBeingEdited"
      />
      <label 
        @dblclick="startEditing" 
        class="todo-text" 
        :data-full-text="isBeingEdited && editingText ? editingText : todo.text"
        :class="{ 'being-edited': isBeingEdited }"
      >
        {{ isBeingEdited && editingText ? editingText : todo.text }}
      </label>
      <div v-if="isBeingEdited" class="editing-indicator">
        <span class="editing-badge">편집중</span>
        <div class="editing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <span class="priority-badge" :class="`priority-${isEditing ? editPriority : todo.priority}`">
        {{ (isEditing ? editPriority : todo.priority) === 'high' ? '●' : (isEditing ? editPriority : todo.priority) === 'medium' ? '●' : '●' }}
      </span>
      <button 
        class="destroy" 
        @click="$emit('removeTodo', todo.id)"
        :disabled="isBeingEdited"
        :class="{ disabled: isBeingEdited }"
      >×</button>
    </div>
    
    <form v-else @submit.prevent="finishEditing" class="edit-form">
      <div class="edit-container">
        <input
          ref="editInput"
          v-model="editText"
          class="edit"
          type="text"
          @blur="finishEditing"
          @keyup.escape="cancelEditing"
          @input="handleEditInput"
          @compositionstart="handleCompositionStart"
          @compositionend="handleCompositionEnd"
          :disabled="isSaving"
        />
        <div v-if="isSaving" class="saving-indicator">
          <span class="saving-text">저장중...</span>
          <div class="saving-spinner"></div>
        </div>
      </div>
      <div class="priority-selector">
        <label class="priority-label">우선순위:</label>
        <div class="priority-buttons">
          <button
            type="button"
            class="priority-btn"
            :class="{ active: editPriority === 'high', 'priority-high': editPriority === 'high' }"
            @mousedown.prevent="handlePriorityChange('high')"
            :disabled="isSaving"
          >
            높음
          </button>
          <button
            type="button"
            class="priority-btn"
            :class="{ active: editPriority === 'medium', 'priority-medium': editPriority === 'medium' }"
            @mousedown.prevent="handlePriorityChange('medium')"
            :disabled="isSaving"
          >
            보통
          </button>
          <button
            type="button"
            class="priority-btn"
            :class="{ active: editPriority === 'low', 'priority-low': editPriority === 'low' }"
            @mousedown.prevent="handlePriorityChange('low')"
            :disabled="isSaving"
          >
            낮음
          </button>
        </div>
      </div>
      <div class="edit-hint">
        ⚡ 실시간 저장 (한글 입력 완료 시 자동 저장). ESC로 취소, Enter로 완료
      </div>
    </form>
  </li>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import type { Todo } from '@/types/Todo'

const props = defineProps<{
  todo: Todo
  isBeingEdited?: boolean
  editingText?: string
  editingUserId?: string
}>()

const emit = defineEmits<{
  toggleTodo: [id: string]
  removeTodo: [id: string]
  updateTodo: [event: { id: string; text?: string; priority?: 'high' | 'medium' | 'low' }]
  startEdit: [id: string]
  endEdit: [id: string]
  editChange: [event: { id: string; text: string }]
}>()

const isEditing = ref(false)
const editText = ref('')
const editPriority = ref<'high' | 'medium' | 'low'>('medium')
const editInput = ref<HTMLInputElement>()
const isSaving = ref(false)
const originalText = ref('')
const originalPriority = ref<'high' | 'medium' | 'low'>('medium')
const lastSavedText = ref('')
const lastSavedPriority = ref<'high' | 'medium' | 'low'>('medium')
const saveQueue = ref<{text: string, priority: 'high' | 'medium' | 'low'}[]>([])
const isComposing = ref(false)

const startEditing = async () => {
  if (props.isBeingEdited) {
    return // 다른 사용자가 편집 중
  }
  
  isEditing.value = true
  editText.value = props.todo.text
  editPriority.value = props.todo.priority
  originalText.value = props.todo.text
  originalPriority.value = props.todo.priority
  lastSavedText.value = props.todo.text
  lastSavedPriority.value = props.todo.priority
  emit('startEdit', props.todo.id)
  await nextTick()
  editInput.value?.focus()
  editInput.value?.select()
}

const instantSave = async () => {
  // 한글 입력 중이면 저장하지 않음
  if (isComposing.value) {
    return
  }
  
  const currentText = editText.value.trim()
  const currentPriority = editPriority.value
  
  // 텍스트가 비어있으면 저장하지 않음 (단, 우선순위만 변경된 경우는 제외)
  if (!currentText) {
    return
  }
  
  // 텍스트와 우선순위 모두 변경사항이 없으면 저장하지 않음
  if (currentText === lastSavedText.value && currentPriority === lastSavedPriority.value) {
    return
  }
  
  // 이미 저장 중이면 큐에 추가하고 리턴
  if (isSaving.value) {
    saveQueue.value = [{ text: currentText, priority: currentPriority }] // 가장 최신 것만 유지
    return
  }
  
  isSaving.value = true
  try {
    const updateData: any = {}
    if (currentText !== lastSavedText.value) {
      updateData.text = currentText
    }
    if (currentPriority !== lastSavedPriority.value) {
      updateData.priority = currentPriority
    }
    
    if (Object.keys(updateData).length > 0) {
      console.log('Saving todo update:', { id: props.todo.id, ...updateData })
      emit('updateTodo', { id: props.todo.id, ...updateData })
      // 저장 성공 후 lastSaved 값들 업데이트
      lastSavedText.value = currentText
      lastSavedPriority.value = currentPriority
    }
    
    // 큐에 있는 다음 저장 처리
    if (saveQueue.value.length > 0) {
      const nextSave = saveQueue.value.pop()!
      saveQueue.value = []
      if ((nextSave.text !== currentText || nextSave.priority !== currentPriority) && !isComposing.value) {
        editText.value = nextSave.text
        editPriority.value = nextSave.priority
        setTimeout(() => instantSave(), 50) // 작은 딜레이로 다음 저장
      }
    }
  } catch (err) {
    console.error('Instant save failed:', err)
  } finally {
    isSaving.value = false
  }
}

const finishEditing = async () => {
  if (isEditing.value) {
    const trimmedText = editText.value.trim()
    
    console.log('finishEditing called with text:', trimmedText, 'lastSaved:', lastSavedText.value)
    
    // 빈 텍스트면 원래 텍스트로 복원 (삭제하지 않음)
    if (!trimmedText) {
      console.log('Empty text, restoring to original:', originalText.value)
      editText.value = originalText.value
      editPriority.value = originalPriority.value
    } else {
      // 변경사항이 있으면 마지막으로 한 번 더 저장
      if (trimmedText !== lastSavedText.value || editPriority.value !== lastSavedPriority.value) {
        console.log('Changes detected, saving...')
        instantSave()
      }
    }
    
    emit('endEdit', props.todo.id)
    isEditing.value = false
  }
}

const cancelEditing = () => {
  emit('endEdit', props.todo.id)
  isEditing.value = false
  editText.value = originalText.value
  editPriority.value = originalPriority.value
  isSaving.value = false
  lastSavedText.value = originalText.value
  lastSavedPriority.value = originalPriority.value
}

const handleCompositionStart = () => {
  isComposing.value = true
}

const handleCompositionEnd = (event: CompositionEvent) => {
  isComposing.value = false
  // 한글 입력이 완료되면 저장 (조금 더 긴 지연시간 적용)
  setTimeout(() => {
    if (!isComposing.value) {
      // composition event에서 최종 텍스트로 업데이트
      if (event.data) {
        editText.value = (event.target as HTMLInputElement).value
      }
      instantSave()
    }
  }, 50)
}

const handleEditInput = async () => {
  // 실시간 변경 사항을 다른 사용자에게 전송 (한글 입력 중에도 보내기)
  emit('editChange', { id: props.todo.id, text: editText.value })
  
  // 한글 입력 중이 아닐 때만 즉시 저장
  if (!isComposing.value) {
    instantSave()
  }
}

const handlePriorityChange = (priority: 'high' | 'medium' | 'low') => {
  console.log('Priority changed from', editPriority.value, 'to', priority)
  editPriority.value = priority
  // 우선순위 변경 시 즉시 저장
  if (!isComposing.value) {
    console.log('Calling instantSave from handlePriorityChange')
    instantSave()
  }
}
</script>

<style scoped>
.todo-item {
  position: relative;
  border-bottom: 1px solid #f1f5f9;
  background: white;
  transition: all 0.2s ease;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-item:hover {
  background: #fafbfc;
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-item.completed .todo-text {
  color: #6b7280;
  text-decoration: line-through;
}

.view {
  display: flex;
  align-items: center;
  padding: 16px 12px;
  gap: 8px;
  min-height: 60px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.toggle {
  width: 16px;
  height: 16px;
  cursor: pointer;
  appearance: none;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  background: white;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.toggle:hover {
  border-color: #3b82f6;
}

.toggle:checked {
  background: #3b82f6;
  border-color: #3b82f6;
}

.toggle:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
}

.todo-text {
  flex: 1;
  cursor: pointer;
  user-select: none;
  word-break: break-word;
  line-height: 1.5;
  color: #374151;
  font-weight: 400;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 0.95rem;
  position: relative;
  min-width: 0;
}

.destroy {
  opacity: 0;
  width: 24px;
  height: 24px;
  font-size: 0.9rem;
  color: #ef4444;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.destroy:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.todo-item:hover .destroy {
  opacity: 1;
}

.edit {
  width: 100%;
  padding: 14px 16px;
  margin: 0;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 0.95rem;
  line-height: 1.5;
  border: 2px solid #3b82f6;
  border-radius: 6px;
  outline: none;
  background: white;
  color: #374151;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.edit-form {
  padding: 16px;
}

.todo-item.editing {
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfc;
}

.todo-item.editing .view {
  display: none;
}

.priority-indicator {
  width: 4px;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  border-radius: 0 4px 4px 0;
}

.priority-indicator.priority-high {
  background: #dc2626;
}

.priority-indicator.priority-medium {
  background: #ea580c;
}

.priority-indicator.priority-low {
  background: #16a34a;
}

.priority-badge {
  font-size: 0.9rem;
  margin-left: 6px;
  font-weight: 500;
  flex-shrink: 0;
}

.priority-badge.priority-high {
  color: #dc2626;
}

.priority-badge.priority-medium {
  color: #ea580c;
}

.priority-badge.priority-low {
  color: #16a34a;
}

.todo-item.priority-high {
  border-left: 4px solid #dc2626;
}

.todo-item.priority-medium {
  border-left: 4px solid #ea580c;
}

.todo-item.priority-low {
  border-left: 4px solid #16a34a;
}

.todo-item.being-edited {
  background: #fffbeb;
  border-left-color: #f59e0b !important;
  animation: pulse-editing 2s infinite;
}

@keyframes pulse-editing {
  0%, 100% { background: #fffbeb; }
  50% { background: #fef3c7; }
}

.todo-text.being-edited {
  color: #d97706;
  font-style: italic;
}

.editing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.editing-badge {
  background: #f59e0b;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.editing-dots {
  display: flex;
  gap: 2px;
}

.editing-dots span {
  width: 4px;
  height: 4px;
  background: #f59e0b;
  border-radius: 50%;
  animation: editing-bounce 1.4s infinite ease-in-out both;
}

.editing-dots span:nth-child(1) { animation-delay: -0.32s; }
.editing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes editing-bounce {
  0%, 80%, 100% { 
    transform: scale(0);
  } 40% { 
    transform: scale(1);
  }
}

.destroy.disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}

.toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.edit-container {
  position: relative;
  width: 100%;
}

.edit:disabled {
  opacity: 0.7;
  cursor: wait;
}

.saving-indicator {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}

.saving-text {
  font-size: 0.8rem;
  color: #059669;
  font-weight: 500;
}

.saving-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #d1fae5;
  border-top: 2px solid #059669;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.edit-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 8px;
  text-align: center;
  padding: 6px 12px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.priority-selector {
  margin-top: 12px;
  margin-bottom: 8px;
}

.priority-label {
  font-size: 0.8rem;
  color: #374151;
  font-weight: 500;
  margin-bottom: 6px;
  display: block;
}

.priority-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.priority-btn {
  flex: 1;
  padding: 6px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 32px;
}

.priority-btn:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.priority-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.priority-btn.active {
  font-weight: 600;
  color: white;
}

.priority-btn.active.priority-high {
  background: #dc2626;
  border-color: #dc2626;
}

.priority-btn.active.priority-medium {
  background: #ea580c;
  border-color: #ea580c;
}

.priority-btn.active.priority-low {
  background: #16a34a;
  border-color: #16a34a;
}

/* iPhone 12 Mini and small devices */
@media (max-width: 390px) {
  .view {
    padding: 14px 16px;
    gap: 8px;
    min-height: 52px;
  }
  
  .toggle {
    width: 16px;
    height: 16px;
  }
  
  .toggle:checked::after {
    font-size: 0.65rem;
  }
  
  .todo-text {
    font-size: 0.85rem;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: calc(100vw - 140px);
  }
  
  .priority-badge {
    font-size: 0.8rem;
    margin-left: 4px;
  }
  
  .destroy {
    width: 20px;
    height: 20px;
    font-size: 0.75rem;
  }
  
  .edit {
    font-size: 0.85rem;
    padding: 12px 16px;
  }
  
  .edit-form {
    padding: 14px 16px;
  }
  
  .saving-text {
    font-size: 0.7rem;
  }
  
  .saving-spinner {
    width: 14px;
    height: 14px;
  }
  
  .edit-hint {
    font-size: 0.7rem;
    padding: 4px 8px;
  }
}

/* Tablet */
@media (min-width: 768px) {
  .view {
    padding: 20px;
    gap: 16px;
    min-height: 68px;
  }
  
  .toggle {
    width: 20px;
    height: 20px;
  }
  
  .toggle:checked::after {
    font-size: 0.75rem;
  }
  
  .todo-text {
    font-size: 1rem;
  }
  
  .destroy {
    width: 30px;
    height: 30px;
    font-size: 1.1rem;
  }
  
  .edit {
    font-size: 1rem;
    padding: 16px 20px;
  }
  
  .edit-form {
    padding: 18px 20px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .view {
    padding: 22px 24px;
    gap: 18px;
    min-height: 72px;
  }
  
  .todo-text {
    font-size: 1.125rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 400px;
  }
  
  .priority-badge {
    margin-left: auto;
    font-size: 1rem;
  }
  
  .todo-text::after {
    content: attr(data-full-text);
    position: absolute;
    top: 100%;
    left: 0;
    background: #1f2937;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.9rem;
    white-space: normal;
    word-break: break-word;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 100;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease;
    pointer-events: none;
    transform: translateY(-4px);
    width: 280px;
    max-width: calc(100vw - 40px);
  }
  
  .todo-text:hover::after {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
  
  .destroy {
    width: 32px;
    height: 32px;
    font-size: 1.2rem;
  }
  
  .edit {
    font-size: 1.125rem;
    padding: 18px 24px;
  }
  
  .edit-form {
    padding: 20px 24px;
  }
}
</style>