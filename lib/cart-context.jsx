"use client"

import { createContext, useContext, useState, useEffect } from "react"

const CART_STORAGE_KEY = "gcinsumos_cart_items"
const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [mounted, setMounted] = useState(false)

  // Hidrata el carrito desde localStorage en el cliente
  useEffect(() => {
    if (typeof window === 'undefined') return
    setMounted(true)
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setCartItems(parsed)
        }
      }
    } catch (error) {
      console.error("No se pudo leer el carrito almacenado", error)
    }
  }, [])

  // Persiste los cambios del carrito
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
    } catch (error) {
      console.error("No se pudo guardar el carrito", error)
    }
  }, [cartItems, mounted])

  const addToCart = (product) => {
    const maxStock = Number.isFinite(product?.stock) ? product.stock : Infinity
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id)
      if (existingItem) {
        const nextQty = Math.min(existingItem.quantity + 1, maxStock)
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: nextQty } : item,
        )
      }
      if (maxStock <= 0) return prevItems
      return [...prevItems, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== productId) return item
        const maxStock = Number.isFinite(item?.stock) ? item.stock : Infinity
        const nextQty = Math.min(quantity, maxStock)
        return { ...item, quantity: nextQty }
      }),
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        mounted,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
