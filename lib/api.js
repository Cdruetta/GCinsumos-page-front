import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

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

    const response = await api.get(`/products?${params.toString()}`)
    return response.data
}

export const getProduct = async (id) => {
    const response = await api.get(`/products/${id}`)
    return response.data
}

export const createProduct = async (productData) => {
    const response = await api.post('/products', productData)
    return response.data
}

export const updateProduct = async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData)
    return response.data
}

export const deleteProduct = async (id) => {
    const response = await api.delete(`/products/${id}`)
    return response.data
}

export const updateStock = async (id, stock) => {
    const response = await api.patch(`/products/${id}/stock`, { stock })
    return response.data
}

// Categories
export const getCategories = async () => {
    const response = await api.get('/categories')
    return response.data
}

// Orders
export const createOrder = async (orderData) => {
    const response = await api.post('/orders', orderData)
    return response.data
}

export const getOrder = async (id) => {
    const response = await api.get(`/orders/${id}`)
    return response.data
}

export const getOrders = async () => {
    const response = await api.get('/orders')
    return response.data
}

export default api
