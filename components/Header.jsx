'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Menubar } from 'primereact/menubar'
import { Button } from 'primereact/button'
import { useCart } from '@/lib/cart-context'

export default function Header() {
  const { cartItems } = useCart()
  const router = useRouter()

  const items = [
    { 
      label: 'Inicio', 
      icon: 'pi pi-home', 
      command: () => router.push('/'),
      style: { fontWeight: 600, transition: 'all 0.3s ease' }
    },
    { 
      label: 'Admin', 
      icon: 'pi pi-cog', 
      command: () => router.push('/admin'),
      style: { fontWeight: 600, transition: 'all 0.3s ease' }
    }
  ]

  const start = (
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
  )

  const end = (
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
  )

  return (
    <div
      className="fade-in-up"
      style={{
        marginBottom: '2rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.8)'
      }}
    >
      <Menubar
        model={items}
        start={start}
        end={end}
        style={{ 
          border: 'none', 
          background: 'transparent', 
          paddingInline: '1.5rem', 
          minHeight: '72px'
        }}
      />
    </div>
  )
}
 