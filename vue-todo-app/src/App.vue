<script setup lang="ts">
import TodoApp from './components/TodoApp.vue'
</script>

<template>
  <div id="app">
    <TodoApp />
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  font-family: 'Noto Sans KR', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-feature-settings: 'kern' 1;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
  width: 100%;
  max-width: 100vw;
}

#app {
  min-height: 100vh;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  max-width: 100vw;
  box-sizing: border-box;
  overflow-x: hidden;
  padding-top: 40px;
}

@media (max-width: 390px) {
  #app {
    padding: 8px;
    padding-top: 20px;
  }
}

@media (min-width: 768px) {
  #app {
    padding: 24px;
  }
}

@media (min-width: 1024px) {
  #app {
    padding: 32px;
  }
}
</style>
