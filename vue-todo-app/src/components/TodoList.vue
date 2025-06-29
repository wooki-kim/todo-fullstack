<template>
  <ul class="todo-list">
    <TodoItem
      v-for="todo in todos"
      :key="todo.id"
      :todo="todo"
      :is-being-edited="isBeingEdited(todo.id)"
      :editing-text="getEditingText(todo.id)"
      :editing-user-id="getEditingUserId(todo.id)"
      @toggle-todo="$emit('toggleTodo', $event)"
      @remove-todo="$emit('removeTodo', $event)"
      @update-todo="$emit('updateTodo', $event)"
      @start-edit="$emit('startEdit', $event)"
      @end-edit="$emit('endEdit', $event)"
      @edit-change="$emit('editChange', $event.id, $event.text)"
    />
  </ul>
</template>

<script setup lang="ts">
import type { Todo } from '@/types/Todo'
import TodoItem from './TodoItem.vue'

defineProps<{
  todos: Todo[]
  isBeingEdited: (id: string) => boolean
  getEditingText: (id: string) => string | undefined
  getEditingUserId: (id: string) => string | undefined
}>()

defineEmits<{
  toggleTodo: [id: string]
  removeTodo: [id: string]
  updateTodo: [event: { id: string; text?: string; priority?: 'high' | 'medium' | 'low' }]
  startEdit: [id: string]
  endEdit: [id: string]
  editChange: [id: string, text: string]
}>()
</script>

<style scoped>
.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>