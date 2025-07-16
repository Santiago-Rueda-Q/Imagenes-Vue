<template>
  <div class="navbar-container">
    <Menubar :model="items" class="mb-4">
      <template #start>
        <div class="flex items-center">
          <i class="pi pi-calendar mr-2 text-xl"></i>
          <span class="font-bold text-lg">Event Manager</span>
        </div>
      </template>
      
      <template #end>
        <div class="flex items-center space-x-2">
          <i class="pi pi-user text-gray-600"></i>
          <span class="text-sm text-gray-600">Admin</span>
        </div>
      </template>
    </Menubar>
  </div>
</template>

<script>
export default {
  name: 'Navbar',
  data() {
    return {
      items: [
        {
          label: 'Eventos',
          icon: 'pi pi-list',
          command: () => {
            this.$router.push('/')
          }
        },
        {
          label: 'Crear Evento',
          icon: 'pi pi-plus',
          command: () => {
            this.$router.push('/create')
          }
        }
      ]
    }
  }
}
</script>

<style scoped>
.navbar-container {
  @apply sticky top-0 z-50 bg-white shadow-sm;
}
</style>