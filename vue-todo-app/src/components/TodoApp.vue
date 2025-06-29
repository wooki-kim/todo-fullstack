<template>
  <div class="todo-app">
    <header class="header">
      <h1>할 일 목록</h1>
      <div class="stats-badge" v-if="todoStats.total > 0">
        전체 {{ todoStats.total }}개 | 남은 일 {{ todoStats.active }}개
      </div>
      <div class="error-message" v-if="error">
        {{ error }}
      </div>
      <TodoInput @add-todo="(text, priority) => addTodo(text, priority)" :disabled="loading" />
    </header>

    <div class="loading" v-if="loading && todoStats.total === 0">
      로딩 중...
    </div>

    <main class="main" v-show="todoStats.total > 0">
      <TodoList 
        :todos="todos" 
        :is-being-edited="isBeingEdited"
        :get-editing-text="getEditingText"
        :get-editing-user-id="getEditingUserId"
        @toggle-todo="toggleTodo"
        @remove-todo="removeTodo"
        @update-todo="(event) => updateTodo(event.id, event)"
        @start-edit="startEditing"
        @end-edit="endEditing"
        @edit-change="emitEditChange"
        :disabled="loading"
      />
    </main>

    <footer class="footer" v-show="todoStats.total > 0">
      <TodoFooter 
        :stats="todoStats"
        :current-filter="filter"
        @set-filter="filter = $event"
        @clear-completed="clearCompleted"
        @clear-all="clearAll"
        @toggle-all="toggleAllTodos"
        :disabled="loading"
      />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useTodos } from '@/composables/useTodos'
import TodoInput from './TodoInput.vue'
import TodoList from './TodoList.vue'
import TodoFooter from './TodoFooter.vue'

const { 
  todos, 
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
  startEditing,
  endEditing,
  emitEditChange,
  isBeingEdited,
  getEditingText,
  getEditingUserId
} = useTodos()
</script>

<style scoped>
.todo-app {
  max-width: 100%;
  width: 100%;
  margin: 0 auto;
  font-family: inherit;
  box-sizing: border-box;
  overflow-x: hidden;
}

.header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.header h1 {
  font-family: 'Poppins', 'Noto Sans KR', sans-serif;
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  color: white;
  margin: 0 0 1.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  letter-spacing: -0.025em;
  line-height: 1.2;
}

.main {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  margin-bottom: 12px;
}

.footer {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

/* iPhone 12 Mini and small devices */
@media (max-width: 390px) {
  .todo-app {
    max-width: calc(100vw - 16px);
    width: calc(100vw - 16px);
    margin: 0;
    padding: 0;
  }
  
  .header {
    margin-bottom: 1rem;
    padding: 0;
  }
  
  .header h1 {
    font-size: 1.4rem;
    margin-bottom: 1rem;
  }
  
  .main,
  .footer {
    border-radius: 12px;
    margin-bottom: 8px;
  }
}

/* Tablet */
@media (min-width: 768px) {
  .todo-app {
    max-width: 520px;
    margin: 2rem auto;
  }
  
  .header {
    margin-bottom: 2rem;
  }
  
  .header h1 {
    font-size: 2.75rem;
    margin-bottom: 2rem;
  }
  
  .main {
    border-radius: 16px;
    margin-bottom: 16px;
  }
  
  .footer {
    border-radius: 16px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .todo-app {
    max-width: 800px;
    margin: 3rem auto;
  }
  
  .header h1 {
    font-size: 3.5rem;
    margin-bottom: 2.5rem;
  }
  
  .header {
    margin-bottom: 2.5rem;
  }
  
  .main {
    margin-bottom: 20px;
  }
}

/* Large Desktop */
@media (min-width: 1440px) {
  .todo-app {
    max-width: 900px;
  }
  
  .header h1 {
    font-size: 4rem;
  }
}

.stats-badge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.error-message {
  background: rgba(244, 67, 54, 0.9);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  text-align: center;
}

.loading {
  text-align: center;
  color: white;
  padding: 2rem;
  font-size: 1.1rem;
}
</style>