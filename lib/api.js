import axios from 'axios'

// Base API: usa NEXT_PUBLIC_API_URL o localhost:5000; las rutas incluyen /api/...
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Log para debugging (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  console.log('🔗 API URL configurada:', API_URL)
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para manejar errores de CORS
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      // Verificar si es un error de CORS
      if (error.message && error.message.includes('CORS')) {
        error.isCorsError = true
        error.corsMessage = 'Error de CORS: El backend no permite solicitudes desde este origen. Verifica la configuración de CORS en el backend.'
      }
    }
    return Promise.reject(error)
  }
)

// Products
export const getProducts = async (filters = {}) => {
  const params = new URLSearchParams()
  if (filters.category && filters.category !== 'Todos') params.append('category', filters.category)
  if (filters.search) params.append('search', filters.search)
  if (filters.minPrice) params.append('minPrice', filters.minPrice)
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)

  const response = await api.get(`/api/products?${params.toString()}`)
  return response.data
}

export const getProduct = async (id) => {
  const response = await api.get(`/api/products/${id}`)
  return response.data
}

export const createProduct = async (productData) => {
  const response = await api.post('/api/products', productData)
  return response.data
}

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/api/products/${id}`, productData)
  return response.data
}

export const deleteProduct = async (id) => {
  const response = await api.delete(`/api/products/${id}`)
  return response.data
}

export const updateStock = async (id, stock) => {
  const response = await api.patch(`/api/products/${id}/stock`, { stock })
  return response.data
}

// Categories
export const getCategories = async () => {
  const response = await api.get('/api/categories')
  return response.data
}

// Orders
export const createOrder = async (orderData) => {
  const response = await api.post('/api/orders', orderData)
  return response.data
}

export const getOrder = async (id) => {
  const response = await api.get(`/api/orders/${id}`)
  return response.data
}

export const getOrders = async () => {
  const response = await api.get('/api/orders')
  return response.data
}

// Users
export const getUsers = async () => {
  const response = await api.get('/api/users')
  return response.data
}

export const getUser = async (id) => {
  const response = await api.get(`/api/users/${id}`)
  return response.data
}

export const createUser = async (userData) => {
  const response = await api.post('/api/users', userData)
  return response.data
}

export const updateUser = async (id, userData) => {
  const response = await api.put(`/api/users/${id}`, userData)
  return response.data
}

export const deleteUser = async (id) => {
  const response = await api.delete(`/api/users/${id}`)
  return response.data
}

export const verifyUser = async (username, password) => {
  const response = await api.post('/api/users/verify', { username, password })
  return response.data
}

export default api
