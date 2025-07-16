import axios from 'axios'

// Obtener la URL base del archivo .env
const API_BASE_URL = import.meta.env.VITE_API_BACKEND || 'http://imagenes-laravel.test/'

// Configuración base de axios para Laragon
const api = axios.create({
  baseURL: `${API_BASE_URL}api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
})

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    // Agregar token de autenticación si existe
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log para debugging
    console.log('Request URL:', config.baseURL + config.url)
    console.log('Request config:', config)
    
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response)
    return response
  },
  (error) => {
    console.error('Response error:', error)
    
    // Mostrar errores de validación específicos
    if (error.response?.status === 422) {
      console.error('Validation errors:', error.response.data)
      if (error.response.data.errors) {
        console.table(error.response.data.errors)
      }
    }
    
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    
    // Manejo de errores de red
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - Check if Laravel server is running')
    }
    
    return Promise.reject(error)
  }
)

// Servicios para eventos
export const eventService = {
  // Obtener todos los eventos
  getEvents: async (params = {}) => {
    try {
      const response = await api.get('/events', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching events:', error)
      throw error
    }
  },

  // Obtener evento por ID
  getEvent: async (id) => {
    try {
      const response = await api.get(`/events/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching event:', error)
      throw error
    }
  },

  // Crear nuevo evento
  createEvent: async (eventData) => {
    try {
      console.log('Creating event with data:', eventData)
      
      const formData = new FormData()
      
      // Validar campos requeridos por el controlador
      const requiredFields = ['title', 'description', 'location', 'event_date', 'color', 'image']
      const missingFields = requiredFields.filter(field => {
        if (field === 'image') {
          return !eventData[field] || !(eventData[field] instanceof File)
        }
        return !eventData[field] || eventData[field] === ''
      })
      
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields)
        throw new Error(`Faltan campos requeridos: ${missingFields.join(', ')}`)
      }
      
      // Agregar campos específicos que espera el controlador
      const fieldsToSend = ['title', 'description', 'location', 'event_date', 'color', 'is_active']
      
      fieldsToSend.forEach(key => {
        if (eventData[key] !== null && eventData[key] !== undefined && eventData[key] !== '') {
          console.log(`Adding field: ${key} = ${eventData[key]}`)
          formData.append(key, eventData[key])
        }
      })
      
      // Agregar imagen (requerida por el controlador)
      if (eventData.image && eventData.image instanceof File) {
        console.log('Adding image:', eventData.image.name)
        formData.append('image', eventData.image)
      } else {
        throw new Error('La imagen es requerida')
      }
      
      // Debug: mostrar el contenido del FormData
      console.log('FormData contents:')
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value)
      }
      
      const response = await api.post('/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Error creating event:', error)
      
      // Mostrar errores de validación específicos
      if (error.response?.status === 422) {
        console.error('Validation failed:', error.response.data)
        if (error.response.data.errors) {
          console.error('Specific validation errors:')
          Object.entries(error.response.data.errors).forEach(([field, messages]) => {
            console.error(`${field}: ${messages.join(', ')}`)
          })
        }
      }
      
      throw error
    }
  },

  // Actualizar evento
  updateEvent: async (id, eventData) => {
    try {
      const formData = new FormData()
      
      // Agregar campos de texto
      Object.keys(eventData).forEach(key => {
        if (key !== 'image' && eventData[key] !== null && eventData[key] !== undefined) {
          formData.append(key, eventData[key])
        }
      })
      
      // Agregar imagen si existe
      if (eventData.image && eventData.image instanceof File) {
        formData.append('image', eventData.image)
      }
      
      // Laravel no soporta PUT con FormData, usamos POST con _method
      formData.append('_method', 'PUT')
      
      const response = await api.post(`/events/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Error updating event:', error)
      throw error
    }
  },

  // Eliminar evento
  deleteEvent: async (id) => {
    try {
      const response = await api.delete(`/events/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting event:', error)
      throw error
    }
  },

  // Filtros específicos
  getActiveEvents: async () => {
    try {
      const response = await api.get('/events/filter/active')
      return response.data
    } catch (error) {
      console.error('Error fetching active events:', error)
      throw error
    }
  },

  getUpcomingEvents: async () => {
    try {
      const response = await api.get('/events/filter/upcoming')
      return response.data
    } catch (error) {
      console.error('Error fetching upcoming events:', error)
      throw error
    }
  },

  getPastEvents: async () => {
    try {
      const response = await api.get('/events/filter/past')
      return response.data
    } catch (error) {
      console.error('Error fetching past events:', error)
      throw error
    }
  }
}

export default api