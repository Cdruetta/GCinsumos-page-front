'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Message } from 'primereact/message'
import { Toast } from 'primereact/toast'
import Header from '../../components/Header'
import ProductCard from '../../components/ProductCard'
import { getProducts, getCategories } from '@/lib/api'
import {
  products as mockProducts,
  categories as mockCategories,
  getProductsByCategory,
  searchProducts
} from '@/lib/products-data'

function CatalogContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'Todos')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [fallbackUsed, setFallbackUsed] = useState(false)
  const toastRef = useRef(null)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // Solo actualizar si hay datos o si realmente cambió
      setProducts(data)
      setError(null)
      setFallbackUsed(false)
    } catch (err) {
      console.error('Error al cargar productos:', err)
      // Fallback a datos mock locales
      let fallback = mockProducts
      const filters = {
        category: selectedCategory,
        search: searchQuery
      }
      if (filters.category && filters.category !== 'Todos') {
        fallback = getProductsByCategory(filters.category)
      }
      if (filters.search) {
        fallback = searchProducts(filters.search)
      }
      setProducts(fallback)
      
      // Detectar si es un error de CORS
      const isCorsError = err.code === 'ERR_NETWORK' || 
                         err.message?.includes('CORS') ||
                         err.message === 'Network Error'
      
      if (isCorsError) {
        setError('Error de CORS: El backend no permite solicitudes desde este origen. Verifica la configuración de CORS en el backend.')
        toastRef.current?.show({
          severity: 'error',
          summary: 'Error de CORS',
          detail: 'El backend necesita actualizar su configuración de CORS para permitir solicitudes desde https://gcinsumos-page-front.onrender.com',
          life: 6000
        })
      } else {
        setError('No pudimos contactar el backend, mostrando datos de ejemplo.')
        toastRef.current?.show({
          severity: 'warn',
          summary: 'Modo sin conexión',
          detail: 'Mostrando catálogo de ejemplo mientras el backend no responde.',
          life: 4000
        })
      }
      
      setFallbackUsed(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Header />
      <Toast ref={toastRef} />

      <div className="container">
        {/* Header del catálogo */}
        <div className="fade-in-up" style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #ff7a00, #ff9f4d)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.5rem',
                lineHeight: 1.2
              }}>
                Catálogo de Productos
              </h1>
              <p style={{
                color: '#64748b',
                fontSize: '1rem',
                margin: 0
              }}>
                Explora nuestra amplia selección de productos
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                background: '#fff',
                color: '#64748b',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#ff7a00'
                e.currentTarget.style.color = '#ff7a00'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.color = '#64748b'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <i className="pi pi-arrow-left"></i>
              Volver al inicio
            </button>
          </div>
          {fallbackUsed && (
            <Message
              severity="warn"
              text="Mostrando datos de ejemplo porque el backend no está disponible."
              style={{
                marginTop: '1rem',
                borderRadius: '12px'
              }}
            />
          )}
        </div>

        {/* Filters */}
        <div
          className="fade-in-up filters-container"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
            marginBottom: '2.5rem',
            padding: '1.75rem',
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)'
          }}
        >
          <div>
            <label htmlFor="search" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem',
              fontWeight: '700',
              color: '#1e293b',
              fontSize: '0.95rem'
            }}>
              <i className="pi pi-search" style={{ color: '#ff7a00' }}></i>
              Buscar Productos
            </label>
            <div style={{ position: 'relative' }}>
              <i className="pi pi-search" style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                zIndex: 1
              }}></i>
              <InputText
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca por nombre, descripción o categoría..."
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
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
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f1f5f9'
                    e.currentTarget.style.color = '#ff7a00'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#64748b'
                  }}
                >
                  <i className="pi pi-times" style={{ fontSize: '0.875rem' }}></i>
                </button>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="category" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem',
              fontWeight: '700',
              color: '#1e293b',
              fontSize: '0.95rem'
            }}>
              <i className="pi pi-filter" style={{ color: '#ff7a00' }}></i>
              Filtrar por Categoría
            </label>
            <Dropdown
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.value)}
              options={categories.map(cat => ({ label: cat, value: cat }))}
              placeholder="Todas las categorías"
              style={{
                width: '100%',
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
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

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div>
        <Header />
        <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
          <ProgressSpinner style={{ width: '50px', height: '50px' }} />
        </div>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  )
}
