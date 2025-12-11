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
        <div 
          className="fade-in-up"
          style={{
            marginBottom: '3rem',
            padding: '3rem 2.5rem',
            background: 'linear-gradient(135deg, #ff7a00 0%, #ff9f4d 50%, #ffb366 100%)',
            borderRadius: '24px',
            color: '#fff',
            display: 'flex',
            gap: '2rem',
            alignItems: 'center',
            boxShadow: '0 25px 60px rgba(255, 122, 0, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Efecto de fondo decorativo */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-30%',
            left: '-5%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
            borderRadius: '50%'
          }} />
          
          <div style={{
            width: 140,
            height: 140,
            borderRadius: '20px',
            background: '#fff',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            position: 'relative',
            zIndex: 1,
            transition: 'transform 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05) rotate(2deg)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
          >
            <img
              src="/gclogo.png"
              alt="GCinsumos"
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          </div>
          <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
            <h1 style={{ 
              fontSize: '3rem', 
              fontWeight: '900', 
              marginBottom: '0.75rem',
              lineHeight: 1.1,
              textShadow: '0 2px 10px rgba(0,0,0,0.1)',
              letterSpacing: '-1px'
            }}>
              Monta tu setup soñado
            </h1>
            <p style={{ 
              fontSize: '1.2rem', 
              opacity: 0.95, 
              marginBottom: '1.5rem',
              lineHeight: 1.5,
              fontWeight: 400
            }}>
              Componentes, periféricos y equipos listos para entregar. Asesoramiento y stock en tiempo real.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  setSelectedCategory('Todos')
                  document.querySelector('#search')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                style={{
                  padding: '0.875rem 1.75rem',
                  borderRadius: '14px',
                  border: 'none',
                  background: '#fff',
                  color: '#ff7a00',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'
                }}
              >
                Ver catálogo
              </button>
              <button
                onClick={() => setSelectedCategory('Laptops')}
                style={{
                  padding: '0.875rem 1.75rem',
                  borderRadius: '14px',
                  border: '2px solid rgba(255,255,255,0.8)',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Laptops destacadas
              </button>
            </div>
            {fallbackUsed && (
              <Message
                severity="warn"
                text="Mostrando datos de ejemplo porque el backend no está disponible."
                style={{ 
                  marginTop: '1.25rem', 
                  background: 'rgba(255,255,255,0.2)', 
                  border: 'none',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)'
                }}
              />
            )}
          </div>
        </div>

        {/* Filters */}
        <div 
          className="fade-in-up"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '1.5rem', 
            marginBottom: '2.5rem',
            padding: '1.5rem',
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)'
          }}
        >
          <div>
            <label htmlFor="search" style={{ 
              display: 'block', 
              marginBottom: '0.75rem', 
              fontWeight: '700',
              color: '#1e293b',
              fontSize: '0.95rem'
            }}>
              Buscar
            </label>
            <InputText
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Busca artículos..."
              style={{ 
                width: '100%',
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#ff7a00'
                e.target.style.boxShadow = '0 0 0 3px rgba(255, 122, 0, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          <div>
            <label htmlFor="category" style={{ 
              display: 'block', 
              marginBottom: '0.75rem', 
              fontWeight: '700',
              color: '#1e293b',
              fontSize: '0.95rem'
            }}>
              Categoría
            </label>
            <Dropdown
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.value)}
              options={categories.map(cat => ({ label: cat, value: cat }))}
              placeholder="Selecciona una categoría"
              style={{ 
                width: '100%',
                borderRadius: '12px',
                border: '2px solid #e2e8f0'
              }}
            />
          </div>
        </div>

        {/* Products Grid */}
        {error && (
          <Message severity="error" text={error} style={{ marginBottom: '1rem', width: '100%' }} />
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <ProgressSpinner style={{ width: '50px', height: '50px' }} />
          </div>
        ) : products.length > 0 ? (
          <>
            <div style={{ 
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ 
                fontSize: '1rem', 
                color: '#64748b',
                fontWeight: 600
              }}>
                Mostrando {products.length} {products.length === 1 ? 'artículo' : 'artículos'}
              </span>
            </div>
            <div className="grid grid-cols-3">
              {products.map((product, index) => (
                <div 
                  key={product.id}
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div 
            className="fade-in-up"
            style={{ 
              textAlign: 'center', 
              padding: '4rem 2rem',
              background: '#fff',
              borderRadius: '20px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)'
            }}
          >
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 1.5rem',
              background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="pi pi-inbox" style={{ fontSize: '2.5rem', color: '#94a3b8' }}></i>
            </div>
            <h3 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '0.5rem',
              fontWeight: 700,
              color: '#1e293b'
            }}>
              No hay artículos
            </h3>
            <p style={{ 
              color: '#64748b',
              fontSize: '1rem'
            }}>
              No encontramos artículos que coincidan con tu búsqueda
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
