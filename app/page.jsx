'use client'

import { useState, useEffect, useRef } from 'react'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Message } from 'primereact/message'
import { Toast } from 'primereact/toast'
import Header from '../components/Header'
import ProductCard from '../components/ProductCard'
import { getProducts, getCategories } from '@/lib/api'
import {
  products as mockProducts,
  categories as mockCategories,
  getProductsByCategory,
  searchProducts
} from '@/lib/products-data'

export default function Home() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [fallbackUsed, setFallbackUsed] = useState(false)
  const toastRef = useRef(null)

  useEffect(() => {
    loadCategories()
    loadProducts()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [selectedCategory, searchQuery])

  const loadCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (err) {
      console.error('Error al cargar categorías:', err)
      setCategories(mockCategories)
    }
  }

  const loadProducts = async () => {
    try {
      setLoading(true)
      const filters = {
        category: selectedCategory,
        search: searchQuery
      }
      const data = await getProducts(filters)
      setProducts(data)
      setError(null)
      setFallbackUsed(false)
    } catch (err) {
      console.error('Error al cargar productos:', err)
      // Fallback a datos mock locales
      let fallback = mockProducts
      if (filters.category && filters.category !== 'Todos') {
        fallback = getProductsByCategory(filters.category)
      }
      if (filters.search) {
        fallback = searchProducts(filters.search)
      }
      setProducts(fallback)
      setError('No pudimos contactar el backend, mostrando datos de ejemplo.')
      setFallbackUsed(true)
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Modo sin conexión',
        detail: 'Mostrando catálogo de ejemplo mientras el backend no responde.',
        life: 4000
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Header />
      <Toast ref={toastRef} />

      <div className="container">
        {/* Hero Section */}
        <div style={{ marginBottom: '2rem', padding: '2rem', backgroundColor: 'white', borderRadius: '8px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            GCinsumos
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#666' }}>
            Tu tienda de artículos tecnológicos de confianza. Encuentra los mejores componentes, periféricos y equipos para tu setup perfecto.
          </p>
          {fallbackUsed && (
            <Message
              severity="warn"
              text="Mostrando datos de ejemplo porque el backend no está disponible."
              style={{ marginTop: '1rem' }}
            />
          )}
        </div>

        {/* Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <label htmlFor="search" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Buscar
            </label>
            <InputText
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Busca artículos..."
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label htmlFor="category" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Categoría
            </label>
            <Dropdown
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.value)}
              options={categories.map(cat => ({ label: cat, value: cat }))}
              placeholder="Selecciona una categoría"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Products Grid */}
        {error && (
          <Message severity="error" text={error} style={{ marginBottom: '1rem', width: '100%' }} />
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <ProgressSpinner />
          </div>
        ) : products.length > 0 ? (
          <>
            <p style={{ marginBottom: '1rem', color: '#666' }}>
              Mostrando {products.length} artículos
            </p>
            <div className="grid grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <i className="pi pi-inbox" style={{ fontSize: '3rem', color: '#999', marginBottom: '1rem' }}></i>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No hay artículos</h3>
            <p style={{ color: '#666' }}>No encontramos artículos que coincidan con tu búsqueda</p>
          </div>
        )}
      </div>
    </div>
  )
}
