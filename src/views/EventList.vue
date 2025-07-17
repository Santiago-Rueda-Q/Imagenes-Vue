<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h1 class="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
          Eventos
        </h1>
        <Button
          icon="pi pi-plus"
          label="Crear Evento"
          @click="$router.push('/create')"
        />
      </div>
      
      <!-- Filtros -->
      <div class="flex flex-wrap gap-2 mb-4">
        <Button
          :severity="activeFilter === 'all' ? 'primary' : 'secondary'"
          label="Todos"
          size="small"
          @click="setFilter('all')"
        />
        <Button
          :severity="activeFilter === 'active' ? 'primary' : 'secondary'"
          label="Activos"
          size="small"
          @click="setFilter('active')"
        />
        <Button
          :severity="activeFilter === 'upcoming' ? 'primary' : 'secondary'"
          label="Próximos"
          size="small"
          @click="setFilter('upcoming')"
        />
        <Button
          :severity="activeFilter === 'past' ? 'primary' : 'secondary'"
          label="Pasados"
          size="small"
          @click="setFilter('past')"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <ProgressSpinner />
    </div>

    <!-- Lista de eventos -->
    <div v-else-if="events.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="event in events"
        :key="event.id"
        class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
      >
        <!-- Header con color personalizado -->
        <div
          class="h-4"
          :style="{ backgroundColor: event.color }"
        ></div>
        
        <!-- Imagen -->
        <div class="relative">
          <img
            :src="event.image_medium_url || '/placeholder-image.jpg'"
            :alt="event.title"
            class="w-full h-48 object-cover"
            @error="handleImageError"
          />
          <div class="absolute top-2 right-2">
            <Tag
              :value="event.is_active ? 'Activo' : 'Inactivo'"
              :severity="event.is_active ? 'success' : 'danger'"
              class="text-xs"
            />
          </div>
        </div>

        <!-- Contenido -->
        <div class="p-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
            {{ event.title }}
          </h3>
          
          <p class="text-gray-600 text-sm mb-3 line-clamp-3">
            {{ event.description }}
          </p>
          
          <div class="space-y-2 mb-4">
            <div class="flex items-center text-sm text-gray-500">
              <i class="pi pi-map-marker mr-2"></i>
              <span>{{ event.location }}</span>
            </div>
            
            <div class="flex items-center text-sm text-gray-500">
              <i class="pi pi-calendar mr-2"></i>
              <span>{{ formatDate(event.event_date) }}</span>
            </div>
          </div>

          <!-- Acciones -->
          <div class="flex justify-between items-center">
            <div class="flex space-x-2">
              <Button
                icon="pi pi-eye"
                severity="info"
                size="small"
                @click="viewEvent(event)"
                :title="'Ver detalles'"
              />
              <Button
                icon="pi pi-pencil"
                severity="warning"
                size="small"
                @click="editEvent(event.id)"
                :title="'Editar'"
              />
              <Button
                icon="pi pi-trash"
                severity="danger"
                size="small"
                @click="confirmDelete(event)"
                :title="'Eliminar'"
              />
            </div>
            
            <!-- Indicador de estado por fecha -->
            <Tag
              :value="getEventStatus(event.event_date)"
              :severity="getEventStatusSeverity(event.event_date)"
              class="text-xs"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="text-center py-12">
      <i class="pi pi-calendar text-4xl text-gray-400 mb-4"></i>
      <h3 class="text-lg font-medium text-gray-600 mb-2">
        No hay eventos disponibles
      </h3>
      <p class="text-gray-500 mb-4">
        Crea tu primer evento para comenzar
      </p>
      <Button
        icon="pi pi-plus"
        label="Crear Evento"
        @click="$router.push('/create')"
      />
    </div>

    <!-- Paginación -->
    <div v-if="pagination.total > pagination.per_page" class="flex justify-center mt-8">
      <div class="flex space-x-2">
        <Button
          icon="pi pi-angle-left"
          :disabled="pagination.current_page === 1"
          @click="changePage(pagination.current_page - 1)"
        />
        
        <span class="flex items-center px-4 py-2 text-sm text-gray-700">
          Página {{ pagination.current_page }} de {{ pagination.last_page }}
        </span>
        
        <Button
          icon="pi pi-angle-right"
          :disabled="pagination.current_page === pagination.last_page"
          @click="changePage(pagination.current_page + 1)"
        />
      </div>
    </div>

    <!-- Modal de detalles del evento -->
    <div v-if="selectedEvent" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click="closeModal">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" @click.stop>
        <!-- Header del modal -->
        <div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 class="text-xl font-bold text-gray-800">Detalles del Evento</h2>
          <Button
            icon="pi pi-times"
            severity="secondary"
            text
            @click="closeModal"
          />
        </div>
        
        <!-- Contenido del modal -->
        <div class="p-6">
          <!-- Color del evento -->
          <div class="h-2 rounded-t-lg mb-4" :style="{ backgroundColor: selectedEvent.color }"></div>
          
          <!-- Imagen -->
          <img
            :src="selectedEvent.image_large_url || '/placeholder-image.jpg'"
            :alt="selectedEvent.title"
            class="w-full h-64 object-cover rounded-lg mb-4"
            @error="handleImageError"
          />
          
          <!-- Información -->
          <div class="space-y-4">
            <div>
              <h3 class="text-2xl font-bold text-gray-800 mb-2">{{ selectedEvent.title }}</h3>
              <div class="flex items-center space-x-2 mb-4">
                <Tag
                  :value="selectedEvent.is_active ? 'Activo' : 'Inactivo'"
                  :severity="selectedEvent.is_active ? 'success' : 'danger'"
                />
                <Tag
                  :value="getEventStatus(selectedEvent.event_date)"
                  :severity="getEventStatusSeverity(selectedEvent.event_date)"
                />
              </div>
            </div>
            
            <div>
              <h4 class="font-semibold text-gray-700 mb-2">Descripción</h4>
              <p class="text-gray-600 whitespace-pre-wrap">{{ selectedEvent.description }}</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 class="font-semibold text-gray-700 mb-2 flex items-center">
                  <i class="pi pi-map-marker mr-2"></i>
                  Ubicación
                </h4>
                <p class="text-gray-600">{{ selectedEvent.location }}</p>
              </div>
              
              <div>
                <h4 class="font-semibold text-gray-700 mb-2 flex items-center">
                  <i class="pi pi-calendar mr-2"></i>
                  Fecha
                </h4>
                <p class="text-gray-600">{{ formatDate(selectedEvent.event_date) }}</p>
              </div>
            </div>
            
            <div>
              <h4 class="font-semibold text-gray-700 mb-2 flex items-center">
                <i class="pi pi-palette mr-2"></i>
                Color del Evento
              </h4>
              <div class="flex items-center space-x-2">
                <div
                  class="w-8 h-8 rounded border-2 border-gray-300"
                  :style="{ backgroundColor: selectedEvent.color }"
                ></div>
                <span class="text-gray-600">{{ selectedEvent.color }}</span>
              </div>
            </div>
          </div>
          
          <!-- Acciones -->
          <div class="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-200">
            <Button
              icon="pi pi-pencil"
              label="Editar"
              severity="warning"
              @click="editEventFromModal(selectedEvent.id)"
            />
            <Button
              icon="pi pi-trash"
              label="Eliminar"
              severity="danger"
              @click="confirmDeleteFromModal(selectedEvent)"
            />
          </div>
        </div>
      </div>
    </div>

    <Toast />
    <ConfirmDialog />
  </div>
</template>

<script>
import { eventService } from '../services/api'

export default {
  name: 'EventList',
  data() {
    return {
      events: [],
      loading: false,
      activeFilter: 'all',
      selectedEvent: null,
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0
      }
    }
  },
  async mounted() {
    await this.loadEvents()
  },
  methods: {
    async loadEvents(page = 1) {
  try {
    this.loading = true
    
    const params = {
      page,
      per_page: this.pagination.per_page
    }

    switch (this.activeFilter) {
      case 'active':
        params.is_active = true
        break
      case 'upcoming':
        params.upcoming = true
        break
      case 'past':
        params.past = true
        break
    }

    console.log('Llamando API con params:', params)
    const response = await eventService.getEvents(params)
    console.log('Respuesta completa:', response)

    if (response.data && response.data.success) {
      console.log('Datos recibidos:', response.data.data)
      
      // Verificar la estructura de los datos
      if (response.data.data && response.data.data.data) {
        // Respuesta paginada
        this.events = response.data.data.data
        this.pagination = {
          current_page: response.data.data.current_page,
          last_page: response.data.data.last_page,
          per_page: response.data.data.per_page,
          total: response.data.data.total
        }
        console.log('Eventos cargados:', this.events)
      } else if (Array.isArray(response.data.data)) {
        // Respuesta simple array
        this.events = response.data.data
        console.log('Eventos cargados (array):', this.events)
      } else {
        console.log('Estructura de datos no reconocida')
        this.events = []
      }
    } else {
      console.log('Respuesta no exitosa:', response.data)
      this.events = []
      this.$toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los eventos',
        life: 3000
      })
    }
  } catch (error) {
    console.error('Error completo:', error)
    this.events = []
    this.$toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al cargar los eventos: ' + error.message,
      life: 3000
    })
    } finally {
      this.loading = false
    }
  },
  
  async setFilter(filter) {
      this.activeFilter = filter
      await this.loadEvents()
    },

    async changePage(page) {
      await this.loadEvents(page)
    },

    viewEvent(event) {
      this.selectedEvent = event
    },

    closeModal() {
      this.selectedEvent = null
    },

    editEvent(eventId) {
      this.$router.push(`/edit/${eventId}`)
    },

    editEventFromModal(eventId) {
      this.closeModal()
      this.$router.push(`/edit/${eventId}`)
    },

    confirmDelete(event) {
      this.$confirm.require({
        message: `¿Estás seguro de que quieres eliminar el evento "${event.title}"?`,
        header: 'Confirmar Eliminación',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sí, eliminar',
        rejectLabel: 'Cancelar',
        acceptClass: 'p-button-danger',
        accept: () => {
          this.deleteEvent(event.id)
        }
      })
    },

    confirmDeleteFromModal(event) {
      this.closeModal()
      this.confirmDelete(event)
    },

    async deleteEvent(eventId) {
      try {
        this.loading = true
        const response = await eventService.deleteEvent(eventId)
        
        if (response.data && response.data.success) {
          this.$toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Evento eliminado correctamente',
            life: 3000
          })
          
          await this.loadEvents(this.pagination.current_page)
        }
      } catch (error) {
        console.error('Error deleting event:', error)
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al eliminar el evento',
          life: 3000
        })
      } finally {
        this.loading = false
      }
    },

    formatDate(dateString) {
      if (!dateString) return ''
      
      try {
        const date = new Date(dateString)
        const options = {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        }
        
        return date.toLocaleDateString('es-ES', options)
      } catch (error) {
        console.error('Error formatting date:', error)
        return dateString
      }
    },

    getEventStatus(eventDate) {
      if (!eventDate) return 'Sin fecha'
      
      try {
        const today = new Date()
        const event = new Date(eventDate)
        
        // Normalizar fechas para comparar solo días
        today.setHours(0, 0, 0, 0)
        event.setHours(0, 0, 0, 0)
        
        if (event < today) {
          return 'Pasado'
        } else if (event.getTime() === today.getTime()) {
          return 'Hoy'
        } else {
          return 'Próximo'
        }
      } catch (error) {
        console.error('Error getting event status:', error)
        return 'Sin fecha'
      }
    },

    getEventStatusSeverity(eventDate) {
      const status = this.getEventStatus(eventDate)
      switch (status) {
        case 'Pasado':
          return 'secondary'
        case 'Hoy':
          return 'warning'
        case 'Próximo':
          return 'success'
        default:
          return 'info'
      }
    },

    handleImageError(event) {
      // Imagen SVG base64 de placeholder
      event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA3MEM4MCA2MS43MTU3IDg2LjcxNTcgNTUgOTUgNTVIMTA1QzExMy4yODQgNTUgMTIwIDYxLjcxNTcgMTIwIDcwVjEzMEMxMjAgMTM4LjI4NCAxMTMuMjg0IDE0NSAxMDUgMTQ1SDk1Qzg2LjcxNTcgMTQ1IDgwIDEzOC4yODQgODAgMTMwVjcwWiIgZmlsbD0iI0Q1RDVENSIvPgo8cGF0aCBkPSJNOTAgODBDOTAgNzUuMDI5NCA5NC4wMjk0IDcxIDk5IDcxQzEwMy45NzEgNzEgMTA4IDc1LjAyOTQgMTA4IDgwQzEwOCA4NC45NzA2IDEwMy45NzEgODkgOTkgODlDOTQuMDI5NCA4OSA5MCA4NC45NzA2IDkwIDgwWiIgZmlsbD0iI0ZGRkZGRiIvPgo8cGF0aCBkPSJNODUgMTIwTDk1IDExMEwxMDUgMTIwTDExNSAxMTBMMTI1IDEyMFYxMzVIODVWMTIwWiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4K'
    }
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>