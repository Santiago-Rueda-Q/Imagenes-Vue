import axios from 'axios'

// Configuración base de axios para Laragon
const api = axios.create({
  baseURL: 'http://VITE_API_BACKEND/events-api/public/api',
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
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Servicios para eventos
export const eventService = {
  // Obtener todos los eventos
  getEvents: (params = {}) => {
    return api.get('/events', { params })
  },

  // Obtener evento por ID
  getEvent: (id) => {
    return api.get(`/events/${id}`)
  },

  // Crear nuevo evento
  createEvent: (eventData) => {
    const formData = new FormData()
    
    // Agregar campos de texto
    Object.keys(eventData).forEach(key => {
      if (key !== 'image') {
        formData.append(key, eventData[key])
      }
    })
    
    // Agregar imagen si existe
    if (eventData.image) {
      formData.append('image', eventData.image)
    }
    
    return api.post('/events', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Actualizar evento
  updateEvent: (id, eventData) => {
    const formData = new FormData()
    
    // Agregar campos de texto
    Object.keys(eventData).forEach(key => {
      if (key !== 'image') {
        formData.append(key, eventData[key])
      }
    })
    
    // Agregar imagen si existe
    if (eventData.image) {
      formData.append('image', eventData.image)
    }
    
    // Laravel no soporta PUT con FormData, usamos POST con _method
    formData.append('_method', 'PUT')
    
    return api.post(`/events/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Eliminar evento
  deleteEvent: (id) => {
    return api.delete(`/events/${id}`)
  },

  // Filtros específicos
  getActiveEvents: () => {
    return api.get('/events/filter/active')
  },

  getUpcomingEvents: () => {
    return api.get('/events/filter/upcoming')
  },

  getPastEvents: () => {
    return api.get('/events/filter/past')
  }
}

export default api