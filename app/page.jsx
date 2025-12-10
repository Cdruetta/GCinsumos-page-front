"use client"

import { useState, useMemo } from "react"
import Header from "@/components/header"
import ProductCard from "@/components/product-card"
import { products, categories, getProductsByCategory, searchProducts } from "@/lib/products-data"

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProducts = useMemo(() => {
    let result = getProductsByCategory(selectedCategory)
    if (searchQuery) {
      result = searchProducts(searchQuery)
    }
    return result
  }, [selectedCategory, searchQuery])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">GCinsumos</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Tu tienda de artículos tecnológicos de confianza. Encuentra los mejores componentes, periféricos y equipos
              para tu setup perfecto.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">Buscar</label>
                <input
                  type="text"
                  placeholder="Busca artículos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase">Categorías</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category)
                        setSearchQuery("")
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length > 0 ? (
              <div>
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {filteredProducts.length} de {products.length} artículos
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg
                  className="w-12 h-12 text-muted-foreground mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-foreground mb-1">No hay artículos</h3>
                <p className="text-muted-foreground text-sm">No encontramos artículos que coincidan con tu búsqueda</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
