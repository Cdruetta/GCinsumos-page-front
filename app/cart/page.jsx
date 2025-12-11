'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
import { InputNumber } from 'primereact/inputnumber'
import { Divider } from 'primereact/divider'
import { Toast } from 'primereact/toast'
import { useRef } from 'react'
import Header from '@/components/Header'
import { useCart } from '@/lib/cart-context'
import { createOrder } from '@/lib/api'

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart()
  const [processing, setProcessing] = useState(false)
  const toast = useRef(null)

  const handleCheckout = async () => {
    try {
      setProcessing(true)

      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: cartTotal,
        tax: Math.round(cartTotal * 0.21),
        total: cartTotal + Math.round(cartTotal * 0.21)
      }

      await createOrder(orderData)

      toast.current.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Orden creada exitosamente',
        life: 3000
      })

      setTimeout(() => {
        clearCart()
      }, 1500)

    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al procesar la orden'
      })
    } finally {
      setProcessing(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div>
        <Header />
        <Toast ref={toast} />
        <div className="container">
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <i className="pi pi-shopping-cart" style={{ fontSize: '4rem', color: '#999', marginBottom: '1rem' }}></i>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Carrito Vacío</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>Aún no has agregado ningún artículo a tu carrito</p>
            <Link href="/">
              <Button label="Volver al catálogo" icon="pi pi-arrow-left" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header />
      <Toast ref={toast} />

      <div className="container">
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Tu Carrito</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Cart Items */}
          <div>
            {cartItems.map((item) => (
              <Card key={item.id} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: '1rem', alignItems: 'center' }}>
                  <img
                    src={item.image || '/placeholder.svg'}
                    alt={item.name}
                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                  />

                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                      {item.name}
                    </h3>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                      ${item.price.toLocaleString('es-AR')}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Button
                        icon="pi pi-minus"
                        className="p-button-rounded p-button-text p-button-sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      />
                      <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '600' }}>
                        {item.quantity}
                      </span>
                      <Button
                        icon="pi pi-plus"
                        className="p-button-rounded p-button-text p-button-sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                      />
                    </div>

                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2196F3' }}>
                      ${(item.price * item.quantity).toLocaleString('es-AR')}
                    </p>

                    <Button
                      label="Eliminar"
                      icon="pi pi-trash"
                      className="p-button-text p-button-danger p-button-sm"
                      onClick={() => removeFromCart(item.id)}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <Card style={{ position: 'sticky', top: '1rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Resumen de Pedido
              </h2>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#666' }}>Subtotal</span>
                <span>${cartTotal.toLocaleString('es-AR')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#666' }}>Envío</span>
                <span>Gratis</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ color: '#666' }}>Impuestos (21%)</span>
                <span>${Math.round(cartTotal * 0.21).toLocaleString('es-AR')}</span>
              </div>

              <Divider />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Total</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#2196F3' }}>
                  ${(cartTotal + Math.round(cartTotal * 0.21)).toLocaleString('es-AR')}
                </span>
              </div>

              <Button
                label={processing ? 'Procesando...' : 'Proceder al Pago'}
                icon="pi pi-check"
                style={{ width: '100%', marginBottom: '0.5rem' }}
                onClick={handleCheckout}
                disabled={processing}
              />

              <Link href="/">
                <Button
                  label="Seguir Comprando"
                  icon="pi pi-arrow-left"
                  className="p-button-outlined"
                  style={{ width: '100%' }}
                />
              </Link>

              <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '1rem', textAlign: 'center' }}>
                Métodos de pago seguros: Tarjeta de crédito, Tarjeta de débito, Transferencia bancaria
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
