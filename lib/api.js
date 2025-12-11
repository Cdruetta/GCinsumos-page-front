import axios from 'axios'

// Base API: usa NEXT_PUBLIC_API_URL o localhost:5000; las rutas incluyen /api/...
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

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

export default api
