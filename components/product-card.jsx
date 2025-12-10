"use client"

import { useCart } from "@/lib/cart-context"

export default function ProductCard({ product }) {
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    addToCart(product)
  }

  return (
    <div className="group bg-card rounded-lg border border-border overflow-hidden hover:shadow-md transition-all duration-300">
      {/* Product Image */}
      <div className="relative w-full h-48 bg-muted overflow-hidden">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.stock < 10 && (
          <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-medium">
            Stock bajo
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col gap-3">
        <div>
          <p className="text-xs text-muted-foreground uppercase font-medium mb-1">{product.category}</p>
          <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">{product.name}</h3>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>

        <div className="flex items-end justify-between mt-auto pt-3 border-t border-border">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-primary">${product.price.toLocaleString("es-AR")}</span>
            <span className="text-xs text-muted-foreground">Stock: {product.stock}</span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="bg-primary text-primary-foreground px-3 py-2 rounded text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  )
}
