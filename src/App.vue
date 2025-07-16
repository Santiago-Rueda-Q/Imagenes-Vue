<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <Navbar />
    
    <main class="min-h-screen">
      <router-view />
    </main>
    
    <Toast />
    <ConfirmDialog />
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue'

export default {
  name: 'App',
  components: {
    Navbar
  }
}
</script>

<style>
#app {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Personalización de componentes PrimeVue */
.p-button {
  @apply transition-all duration-200;
}

.p-button:hover {
  @apply transform scale-105;
}

.p-card {
  @apply border border-gray-200;
}

.p-inputtext:focus,
.p-textarea:focus,
.p-calendar:focus-within {
  @apply ring-2 ring-blue-500 ring-opacity-50;
}

.p-invalid {
  @apply border-red-500 ring-2 ring-red-500 ring-opacity-50;
}

/* Estilos para el modal */
.p-dialog-mask {
  @apply backdrop-blur-sm;
}

/* Responsive utilities */
@media (max-width: 768px) {
  .container {
    @apply px-4;
  }
}
</style>