"use client"

import { useState } from "react"
import Link from "next/link"
import Header from "@/components/header"
import { useCart } from "@/lib/cart-context"

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart, mounted } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">Cargando carrito...</div>
        </div>
      </div>
    )
  }

  const handleCheckout = () => {
    setIsProcessing(true)
    setTimeout(() => {
      alert("Gracias por tu compra. Esta es una tienda de demostración.")
      clearCart()
      setIsProcessing(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg className="w-16 h-16 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h1 className="text-2xl font-bold text-foreground mb-2">Carrito Vacío</h1>
            <p className="text-muted-foreground mb-6">Aún no has agregado ningún artículo a tu carrito</p>
            <Link
              href="/"
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Volver al catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <h1 className="text-3xl font-bold text-foreground">Tu Carrito</h1>
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">${item.price.toLocaleString("es-AR")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 bg-muted text-muted-foreground rounded hover:bg-primary/20 transition-colors text-sm font-medium"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 bg-muted text-muted-foreground rounded hover:bg-primary/20 transition-colors text-sm font-medium"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        ${(item.price * item.quantity).toLocaleString("es-AR")}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-destructive hover:text-destructive/80 transition-colors mt-1"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1 sticky top-20 h-fit">
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Resumen de Pedido</h2>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${cartTotal.toLocaleString("es-AR")}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Envío</span>
                    <span>Gratis</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Impuestos</span>
                    <span>${Math.round(cartTotal * 0.21).toLocaleString("es-AR")}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      ${(cartTotal + Math.round(cartTotal * 0.21)).toLocaleString("es-AR")}
                    </span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? "Procesando..." : "Proceder al Pago"}
                  </button>

                  <Link
                    href="/"
                    className="block w-full mt-2 border border-border text-foreground py-2 rounded-lg font-medium text-center hover:bg-muted transition-colors"
                  >
                    Seguir Comprando
                  </Link>
                </div>

                <div className="text-xs text-muted-foreground">
                  Métodos de pago seguros: Tarjeta de crédito, Tarjeta de débito, Transferencia bancaria
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
