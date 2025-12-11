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
    { label: 'Inicio', icon: 'pi pi-home', command: () => router.push('/') },
    { label: 'Admin', icon: 'pi pi-cog', command: () => router.push('/admin') }
  ]

  const start = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => router.push('/')}>
      <Image src="/gclogo.png" alt="GCinsumos" width={40} height={40} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ fontWeight: 700, color: '#ff7a00' }}>GCinsumos</span>
        <span style={{ fontSize: '0.75rem', color: '#475569' }}>Tech & periféricos</span>
      </div>
    </div>
  )

  const end = (
    <Button
      icon="pi pi-shopping-cart"
      label="Carrito"
      className="p-button-outlined p-button-warning"
      badge={cartItems.length > 0 ? cartItems.length.toString() : undefined}
      badgeClassName="p-badge-danger"
      onClick={() => router.push('/cart')}
    />
  )

  return (
    <div style={{ marginBottom: '2rem', boxShadow: '0 8px 24px rgba(0,0,0,0.05)', borderRadius: 12, overflow: 'hidden' }}>
      <Menubar model={items} start={start} end={end} style={{ border: 'none' }} />
    </div>
  )
}
 