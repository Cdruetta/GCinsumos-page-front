'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Message } from 'primereact/message'
import { Toast } from 'primereact/toast'
import { Carousel } from 'primereact/carousel'
import Header from '../components/Header'
import { getProducts } from '@/lib/api'
import { products as mockProducts } from '@/lib/products-data'

// Función helper para obtener la URL completa de la imagen
const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder.svg'
  
  // Si ya es una URL completa (http/https), validar que sea una imagen
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    // Verificar que no sea una URL de página HTML
    // Las URLs de imágenes suelen tener extensiones de imagen o rutas específicas
    const isImageUrl = imagePath.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?|#|$)/i) ||
                      imagePath.includes('/image/') ||
                      imagePath.includes('/img/') ||
                      imagePath.includes('/uploads/') ||
                      imagePath.includes('/media/') ||
                      imagePath.includes('/assets/') ||
                      imagePath.includes('i.imgur.com') ||
                      imagePath.includes('res.cloudinary.com') ||
                      imagePath.includes('goetech.ar') ||
                      imagePath.includes('cdn.') ||
                      imagePath.includes('static.')
    
    // Si tiene ? o # y no parece ser una imagen, probablemente es una página web
    // Pero intentar cargarla de todas formas (algunos CDNs usan query params)
    if ((imagePath.includes('?') || imagePath.includes('#')) && !isImageUrl) {
      // Si es de un dominio conocido de imágenes, permitirlo
      const knownImageDomains = ['imgur.com', 'cloudinary.com', 'unsplash.com', 'pexels.com', 'pixabay.com', 'goetech.ar']
      const isKnownDomain = knownImageDomains.some(domain => imagePath.includes(domain))
      
      if (!isKnownDomain) {
        console.warn('⚠️ URL parece ser una página web, no una imagen:', imagePath)
        console.warn('💡 Necesitas la URL directa de la imagen. Ver: COMO_OBTENER_URL_IMAGEN.md')
        // Intentar cargarla de todas formas, el navegador decidirá
      }
    }
    
    return imagePath
  }
  
  // Si es una ruta relativa que empieza con /, asumir que está en el backend
  if (imagePath.startsWith('/')) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    return `${API_URL}${imagePath}`
  }
  
  // Si es una ruta relativa sin /, agregar / y usar el backend
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  return `${API_URL}/${imagePath}`
}

export default function Home() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [fallbackUsed, setFallbackUsed] = useState(false)
  const toastRef = useRef(null)

  // Memoizar productos con imágenes para evitar recálculos y parpadeo
  // Mostrar todos los productos, pero priorizar los que tienen imágenes
  const productsWithImages = useMemo(() => {
    const withImages = products.filter(p => p.image && p.image.trim() !== '')
    const withoutImages = products.filter(p => !p.image || p.image.trim() === '')
    // Combinar: primero los que tienen imágenes, luego los que no
    return [...withImages, ...withoutImages].slice(0, 10)
  }, [products])

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await getProducts({})
      // Actualizar productos sin causar parpadeo
      setProducts(data)
      setFallbackUsed(false)
    } catch (err) {
      console.error('Error al cargar productos:', err)
      
      // Detectar si es un error de CORS
      const isCorsError = err.code === 'ERR_NETWORK' || 
                         err.message?.includes('CORS') ||
                         err.message === 'Network Error'
      
      // Fallback a datos mock locales
      setProducts(mockProducts)
      setFallbackUsed(true)
      
      if (isCorsError) {
        toastRef.current?.show({
          severity: 'error',
          summary: 'Error de CORS',
          detail: 'El backend no permite solicitudes desde este origen. Verifica la configuración de CORS en el backend.',
          life: 6000
        })
      } else {
        toastRef.current?.show({
          severity: 'warn',
          summary: 'Modo sin conexión',
          detail: 'Mostrando productos de ejemplo mientras el backend no responde.',
          life: 4000
        })
      }
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
          className="fade-in-up hero-section"
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
          
          <div 
            className="hero-logo"
            style={{
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
              transition: 'transform 0.3s ease',
              flexShrink: 0
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
            <h1 
              className="hero-title"
              style={{ 
                fontSize: '3rem', 
                fontWeight: '900', 
                marginBottom: '0.75rem',
                lineHeight: 1.1,
                textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                letterSpacing: '-1px'
              }}
            >
              Monta tu setup soñado
            </h1>
            <p 
              className="hero-description"
              style={{ 
                fontSize: '1.2rem', 
                opacity: 0.95, 
                marginBottom: '1.5rem',
                lineHeight: 1.5,
                fontWeight: 400
              }}
            >
              Componentes, periféricos y equipos listos para entregar. Asesoramiento y stock en tiempo real.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => router.push('/catalog')}
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
                Ver catálogo completo
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

        {/* Products Carousel */}
        {loading && products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <ProgressSpinner style={{ width: '50px', height: '50px' }} />
          </div>
        ) : products.length > 0 ? (
          <div className="fade-in-up" style={{ marginBottom: '2rem' }}>
            <div style={{ 
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="pi pi-images" style={{ fontSize: '1.25rem', color: '#ff7a00' }}></i>
                <h2 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 700,
                  color: '#1e293b',
                  margin: 0
                }}>
                  Productos Destacados
                </h2>
              </div>
              <span style={{ 
                fontSize: '0.95rem', 
                color: '#64748b',
                fontWeight: 500
              }}>
                {products.length} {products.length === 1 ? 'producto' : 'productos'}
              </span>
            </div>
            
            <div style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(255, 122, 0, 0.1)'
            }}>
              {productsWithImages.length > 0 ? (
                <Carousel
                  value={productsWithImages}
                  numVisible={3}
                  numScroll={1}
                responsiveOptions={[
                  {
                    breakpoint: '1024px',
                    numVisible: 2,
                    numScroll: 1
                  },
                  {
                    breakpoint: '768px',
                    numVisible: 1,
                    numScroll: 1
                  }
                ]}
                itemTemplate={(product) => (
                  <div
                    key={product.id}
                    style={{
                      padding: '0.75rem',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        paddingTop: '75%', // Aspect ratio 4:3
                        background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        marginBottom: '1rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 122, 0, 0.2)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}
                      onClick={() => {
                        // Navegar al catálogo con filtros aplicados
                        router.push(`/catalog?category=${encodeURIComponent(product.category)}&search=${encodeURIComponent(product.name)}`)
                      }}
                    >
                      {product.image && product.image.trim() !== '' ? (
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          loading="lazy"
                          onError={(e) => {
                            console.error('❌ Error cargando imagen del producto:', product.name)
                            console.error('   Ruta original:', product.image)
                            console.error('   URL generada:', getImageUrl(product.image))
                            console.error('   💡 Si usaste una URL de página web, necesitas la URL directa de la imagen')
                            e.target.style.display = 'none'
                            e.target.onerror = null // Evitar loop infinito
                            const placeholder = e.target.parentElement.querySelector('.image-placeholder')
                            if (!placeholder) {
                              const div = document.createElement('div')
                              div.className = 'image-placeholder'
                              div.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #94a3b8; background: linear-gradient(135deg, #f8f9fa, #e9ecef);'
                              div.innerHTML = '<i class="pi pi-image" style="font-size: 3rem;"></i>'
                              e.target.parentElement.appendChild(div)
                            }
                          }}
                          onLoad={() => {
                            console.log('✅ Imagen cargada exitosamente para:', product.name, 'URL:', getImageUrl(product.image))
                          }}
                        />
                      ) : (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#94a3b8',
                          background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)'
                        }}>
                          <div style={{ textAlign: 'center' }}>
                            <i className="pi pi-image" style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}></i>
                            <span style={{ fontSize: '0.75rem' }}>Sin imagen</span>
                          </div>
                        </div>
                      )}
                      {/* Badge de categoría */}
                      <div style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        background: 'linear-gradient(135deg, #ff7a00, #ff9f4d)',
                        color: '#fff',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                      }}>
                        {product.category}
                      </div>
                      {/* Badge de stock */}
                      {product.stock > 0 && (
                        <div style={{
                          position: 'absolute',
                          bottom: '0.75rem',
                          left: '0.75rem',
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)',
                          padding: '0.375rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#059669',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}>
                          <i className="pi pi-check-circle" style={{ fontSize: '0.75rem' }}></i>
                          En stock
                        </div>
                      )}
                    </div>
                    {/* Información del producto */}
                    <div style={{ padding: '0 0.5rem' }}>
                      <h3 style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: '#1e293b',
                        marginBottom: '0.5rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {product.name}
                      </h3>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem'
                      }}>
                        <span style={{
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          background: 'linear-gradient(135deg, #ff7a00, #ff9f4d)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>
                          ${product.price?.toLocaleString('es-AR') || '0'}
                        </span>
                        {product.stock > 0 && (
                          <span style={{
                            fontSize: '0.875rem',
                            color: '#64748b',
                            fontWeight: 500
                          }}>
                            {product.stock} disponibles
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                  autoplayInterval={4000}
                  circular
                  showIndicators={true}
                  showNavigators={true}
                />
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '3rem',
                  color: '#64748b'
                }}>
                  <i className="pi pi-image" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}></i>
                  <p>No hay productos para mostrar en el carrusel</p>
                </div>
              )}
            </div>
          </div>
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
