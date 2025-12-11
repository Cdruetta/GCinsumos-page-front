'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from 'primereact/button'
import { useCart } from '@/lib/cart-context'

export default function Header() {
  const { cartItems } = useCart()
  const router = useRouter()

  return (
    <div
      className="fade-in-up"
      style={{
        marginBottom: '2rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #f1f5f9 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 122, 0, 0.1)'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.5rem',
        minHeight: '72px'
      }}>
        {/* Logo y texto a la izquierda */}
        <div
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            cursor: 'pointer',
            transition: 'transform 0.2s ease'
          }}
          onClick={() => router.push('/')}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ff7a00, #ff9f4d)',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(255, 122, 0, 0.3)'
          }}>
            <Image 
              src="/gclogo.png" 
              alt="GCinsumos" 
              width={36} 
              height={36}
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ 
              fontWeight: 800, 
              background: 'linear-gradient(135deg, #ff7a00, #ff9f4d)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.15rem',
              letterSpacing: '-0.5px'
            }}>
              GCinsumos
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
              Tech & periféricos
            </span>
          </div>
        </div>

        {/* Menú y carrito a la derecha con separación */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          {/* Menú de navegación */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <button
              onClick={() => router.push('/')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#1e293b',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f1f5f9'
                e.currentTarget.style.color = '#ff7a00'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#1e293b'
              }}
            >
              <i className="pi pi-home" style={{ fontSize: '1rem' }}></i>
              <span>Inicio</span>
            </button>
            <button
              onClick={() => router.push('/admin')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#1e293b',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f1f5f9'
                e.currentTarget.style.color = '#ff7a00'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#1e293b'
              }}
            >
              <i className="pi pi-cog" style={{ fontSize: '1rem' }}></i>
              <span>Admin</span>
            </button>
          </div>

          {/* Botón de carrito */}
          <Button
            icon="pi pi-shopping-cart"
            label="Carrito"
            className="p-button-warning"
            badge={cartItems.length > 0 ? cartItems.length.toString() : undefined}
            badgeClassName="p-badge-danger"
            onClick={() => router.push('/cart')}
            style={{
              background: 'linear-gradient(135deg, #ff7a00, #ff9f4d)',
              border: 'none',
              fontWeight: 600,
              padding: '0.6rem 1.2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(255, 122, 0, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 122, 0, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 122, 0, 0.3)'
            }}
          />
        </div>
      </div>
    </div>
  )
}
 