<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold mb-6 text-gray-800">
          {{ isEditing ? 'Editar Evento' : 'Crear Nuevo Evento' }}
        </h1>
        
        <form @submit.prevent="submitForm">
          <!-- Título -->
          <div class="form-field">
            <label class="form-label">Título *</label>
            <InputText
              v-model="formData.title"
              :class="{ 'p-invalid': errors.title }"
              class="w-full"
              placeholder="Ingresa el título del evento"
            />
            <small v-if="errors.title" class="error-message">
              {{ errors.title }}
            </small>
          </div>

          <!-- Descripción -->
          <div class="form-field">
            <label class="form-label">Descripción *</label>
            <Textarea
              v-model="formData.description"
              :class="{ 'p-invalid': errors.description }"
              class="w-full"
              rows="4"
              placeholder="Describe el evento"
            />
            <small v-if="errors.description" class="error-message">
              {{ errors.description }}
            </small>
          </div>

          <!-- Ubicación -->
          <div class="form-field">
            <label class="form-label">Ubicación *</label>
            <InputText
              v-model="formData.location"
              :class="{ 'p-invalid': errors.location }"
              class="w-full"
              placeholder="Ubicación del evento"
            />
            <small v-if="errors.location" class="error-message">
              {{ errors.location }}
            </small>
          </div>

          <!-- Fecha del evento -->
          <div class="form-field">
            <label class="form-label">Fecha del Evento *</label>
            <Calendar
              v-model="formData.event_date"
              :class="{ 'p-invalid': errors.event_date }"
              class="w-full"
              dateFormat="yy-mm-dd"
              showIcon
              placeholder="Selecciona la fecha"
            />
            <small v-if="errors.event_date" class="error-message">
              {{ errors.event_date }}
            </small>
          </div>

          <!-- Color -->
          <div class="form-field">
            <label class="form-label">Color del Evento *</label>
            <div class="flex items-center space-x-4">
              <ColorPicker
                v-model="formData.color"
                :class="{ 'p-invalid': errors.color }"
                format="hex"
              />
              <InputText
                v-model="formData.color"
                :class="{ 'p-invalid': errors.color }"
                class="flex-1"
                placeholder="#000000"
                @blur="validateColor"
              />
              <div
                class="w-8 h-8 rounded border-2 border-gray-300"
                :style="{ backgroundColor: formData.color }"
              ></div>
            </div>
            <small v-if="errors.color" class="error-message">
              {{ errors.color }}
            </small>
          </div>

          <!-- Imagen -->
          <div class="form-field">
            <label class="form-label">Imagen *</label>
            <FileUpload
              mode="basic"
              accept="image/*"
              :maxFileSize="2048000"
              :class="{ 'p-invalid': errors.image }"
              chooseLabel="Seleccionar Imagen"
              @select="onFileSelect"
              @clear="onFileClear"
            />
            <small v-if="errors.image" class="error-message">
              {{ errors.image }}
            </small>
            <small class="text-gray-500 text-sm mt-1">
              Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 2MB
            </small>
            
            <!-- Vista previa de la imagen -->
            <div v-if="imagePreview" class="mt-4">
              <img
                :src="imagePreview"
                alt="Vista previa"
                class="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
              />
            </div>
          </div>

          <!-- Estado activo -->
          <div class="form-field">
            <div class="flex items-center">
              <Checkbox
                v-model="formData.is_active"
                :binary="true"
                inputId="is_active"
              />
              <label for="is_active" class="ml-2 text-sm text-gray-700">
                Evento activo
              </label>
            </div>
          </div>

          <!-- Botones -->
          <div class="flex justify-end space-x-4 mt-6">
            <Button
              type="button"
              label="Cancelar"
              severity="secondary"
              @click="$router.push('/')"
            />
            <Button
              type="submit"
              :label="isEditing ? 'Actualizar' : 'Crear'"
              :loading="loading"
              :disabled="loading"
            />
          </div>
        </form>
      </div>
    </div>
    
    <Toast />
  </div>
</template>

<script>
import { eventService } from '../services/api'

export default {
  name: 'EventForm',
  props: {
    id: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      formData: {
        title: '',
        description: '',
        location: '',
        event_date: null,
        color: '#3B82F6',
        image: null,
        is_active: true
      },
      errors: {},
      loading: false,
      imagePreview: null
    }
  },
  computed: {
    isEditing() {
      return !!this.id
    }
  },
  async mounted() {
    if (this.isEditing) {
      await this.loadEvent()
    }
  },
  methods: {
    async loadEvent() {
      try {
        this.loading = true
        const response = await eventService.getEvent(this.id)
        
        if (response.data.success) {
          const event = response.data.data
          this.formData = {
            title: event.title,
            description: event.description,
            location: event.location,
            event_date: new Date(event.event_date),
            color: event.color,
            image: null,
            is_active: event.is_active
          }
          
          // Mostrar imagen actual como preview
          if (event.image_medium_url) {
            this.imagePreview = event.image_medium_url
          }
        }
      } catch (error) {
        console.error('Error loading event:', error)
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el evento',
          life: 3000
        })
      } finally {
        this.loading = false
      }
    },

    onFileSelect(event) {
      const file = event.files[0]
      if (file) {
        this.formData.image = file
        
        // Crear vista previa
        const reader = new FileReader()
        reader.onload = (e) => {
          this.imagePreview = e.target.result
        }
        reader.readAsDataURL(file)
        
        // Limpiar error de imagen
        if (this.errors.image) {
          delete this.errors.image
        }
      }
    },

    onFileClear() {
      this.formData.image = null
      this.imagePreview = null
    },

    validateColor() {
      const hexPattern = /^#[0-9A-Fa-f]{6}$/
      if (!hexPattern.test(this.formData.color)) {
        this.errors.color = 'El color debe ser un valor hexadecimal válido (ej: #FF0000)'
      } else {
        delete this.errors.color
      }
    },

    validateForm() {
      this.errors = {}

      // Título
      if (!this.formData.title.trim()) {
        this.errors.title = 'El título es obligatorio'
      } else if (this.formData.title.length > 255) {
        this.errors.title = 'El título no puede exceder 255 caracteres'
      }

      // Descripción
      if (!this.formData.description.trim()) {
        this.errors.description = 'La descripción es obligatoria'
      }

      // Ubicación
      if (!this.formData.location.trim()) {
        this.errors.location = 'La ubicación es obligatoria'
      } else if (this.formData.location.length > 255) {
        this.errors.location = 'La ubicación no puede exceder 255 caracteres'
      }

      // Fecha
      if (!this.formData.event_date) {
        this.errors.event_date = 'La fecha del evento es obligatoria'
      }

      // Color
      const hexPattern = /^#[0-9A-Fa-f]{6}$/
      if (!hexPattern.test(this.formData.color)) {
        this.errors.color = 'El color debe ser un valor hexadecimal válido'
      }

      // Imagen (solo obligatoria al crear)
      if (!this.isEditing && !this.formData.image) {
        this.errors.image = 'La imagen es obligatoria'
      }

      return Object.keys(this.errors).length === 0
    },

    async submitForm() {
      if (!this.validateForm()) {
        this.$toast.add({
          severity: 'warn',
          summary: 'Validación',
          detail: 'Por favor corrige los errores en el formulario',
          life: 3000
        })
        return
      }

      try {
        this.loading = true

        // Preparar datos para envío
        const submitData = {
          ...this.formData,
          event_date: this.formData.event_date.toISOString().split('T')[0]
        }

        let response
        if (this.isEditing) {
          response = await eventService.updateEvent(this.id, submitData)
        } else {
          response = await eventService.createEvent(submitData)
        }

        if (response.data.success) {
          this.$toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: response.data.message,
            life: 3000
          })
          
          setTimeout(() => {
            this.$router.push('/')
          }, 1500)
        }
      } catch (error) {
        console.error('Error submitting form:', error)
        
        if (error.response?.data?.errors) {
          this.errors = error.response.data.errors
        }
        
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: error.response?.data?.message || 'Error al procesar el formulario',
          life: 3000
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>