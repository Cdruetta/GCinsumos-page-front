'use client'

import { useState } from 'react'
import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
import { Tag } from 'primereact/tag'
import { useCart } from '@/lib/cart-context'

// Función helper para obtener la URL completa de la imagen
const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder.svg'
  
  // Si ya es una URL completa (http/https), usarla directamente
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
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

export default function ProductCard({ product }) {
    const { addToCart } = useCart()
    const [isHovered, setIsHovered] = useState(false)

    const header = (
        <div style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '12px 12px 0 0',
            background: '#f8f9fa'
        }}>
            <img
                alt={product.name}
                src={getImageUrl(product.image)}
                style={{ 
                    width: '100%', 
                    height: '240px', 
                    objectFit: 'cover',
                    transition: 'transform 0.4s ease'
                }}
                onError={(e) => {
                    console.error('Error cargando imagen del producto:', product.name, 'Ruta original:', product.image, 'URL generada:', getImageUrl(product.image))
                    e.target.src = '/placeholder.svg'
                    e.target.onerror = null // Evitar loop infinito
                }}
                onLoad={() => {
                    console.log('Imagen cargada exitosamente para:', product.name, 'URL:', getImageUrl(product.image))
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)'
                    setIsHovered(true)
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    setIsHovered(false)
                }}
            />
            <div style={{
                position: 'absolute',
                top: '0.75rem',
                right: '0.75rem',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#64748b'
            }}>
                {product.category}
            </div>
        </div>
    )

    const footer = (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            paddingTop: '1rem',
            borderTop: '1px solid #e2e8f0'
        }}>
            <div>
                <span style={{ 
                    fontSize: '0.875rem', 
                    color: '#64748b',
                    fontWeight: 500
                }}>
                    Precio
                </span>
                <div style={{ 
                    fontSize: '1.75rem', 
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #ff7a00, #ff9f4d)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.2
                }}>
                    ${product.price.toLocaleString('es-AR')}
                </div>
            </div>
            <Button
                label="Agregar"
                icon="pi pi-shopping-cart"
                onClick={() => addToCart(product)}
                disabled={product.stock === 0}
                className="p-button-warning"
                style={{
                    background: product.stock > 0 
                        ? 'linear-gradient(135deg, #ff7a00, #ff9f4d)' 
                        : '#cbd5e1',
                    border: 'none',
                    fontWeight: 600,
                    padding: '0.6rem 1.2rem',
                    borderRadius: '12px',
                    boxShadow: product.stock > 0 
                        ? '0 4px 12px rgba(255, 122, 0, 0.3)' 
                        : 'none',
                    transition: 'all 0.3s ease',
                    opacity: product.stock === 0 ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                    if (product.stock > 0) {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 122, 0, 0.4)'
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = product.stock > 0 
                        ? '0 4px 12px rgba(255, 122, 0, 0.3)' 
                        : 'none'
                }}
            />
        </div>
    )

    return (
        <Card
            title={
                <span style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 700,
                    color: '#1e293b',
                    lineHeight: 1.3
                }}>
                    {product.name}
                </span>
            }
            header={header}
            footer={footer}
            className="hover-lift fade-in-up"
            style={{ 
                marginBottom: '1.5rem',
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                overflow: 'hidden',
                background: '#fff',
                transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.12)'
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}
        >
            <p style={{ 
                marginBottom: '1rem', 
                color: '#64748b',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                minHeight: '3rem'
            }}>
                {product.description}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Tag
                    value={product.stock > 0 ? `Stock: ${product.stock}` : 'Sin stock'}
                    severity={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'danger'}
                    style={{
                        borderRadius: '20px',
                        padding: '0.25rem 0.75rem',
                        fontWeight: 600,
                        fontSize: '0.8rem'
                    }}
                />
            </div>
        </Card>
    )
}
