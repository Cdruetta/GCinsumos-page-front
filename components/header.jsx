'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menubar } from 'primereact/menubar'
import { Badge } from 'primereact/badge'
import { Button } from 'primereact/button'
import { useCart } from '@/lib/cart-context'

export default function Header() {
  const { cartItems } = useCart()
  const router = useRouter()

  const items = [
    {
      label: 'Inicio',
      icon: 'pi pi-home',
      command: () => router.push('/')
    },
    {
      label: 'Admin',
      icon: 'pi pi-cog',
      command: () => router.push('/admin')
    }
  ]

  const end = (
    <Link href="/cart">
      <Button
        icon="pi pi-shopping-cart"
        label="Carrito"
        className="p-button-outlined"
        badge={cartItems.length > 0 ? cartItems.length.toString() : null}
        badgeClassName="p-badge-danger"
      />
    </Link>
  )

  return (
    <div style={{ marginBottom: '2rem' }}>
      <Menubar model={items} end={end} />
    </div>
  )
}
