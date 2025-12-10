"use client"

import { useState } from "react"
import Header from "@/components/header"
import { products as initialProducts } from "@/lib/products-data"

export default function AdminPage() {
  const [productList, setProductList] = useState(initialProducts)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
  })

  const filteredProducts = productList.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddProduct = () => {
    if (formData.name && formData.category && formData.price && formData.stock && formData.description) {
      if (editingId) {
        setProductList(
          productList.map((p) =>
            p.id === editingId
              ? {
                  ...p,
                  ...formData,
                  price: Number.parseInt(formData.price),
                  stock: Number.parseInt(formData.stock),
                }
              : p,
          ),
        )
        setEditingId(null)
      } else {
        const newProduct = {
          id: Math.max(...productList.map((p) => p.id), 0) + 1,
          ...formData,
          price: Number.parseInt(formData.price),
          stock: Number.parseInt(formData.stock),
          image: "/generic-product-display.png",
        }
        setProductList([...productList, newProduct])
      }
      setFormData({
        name: "",
        category: "",
        price: "",
        stock: "",
        description: "",
      })
      setIsAddingProduct(false)
    }
  }

  const handleEditProduct = (product) => {
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description,
    })
    setEditingId(product.id)
    setIsAddingProduct(true)
  }

  const handleDeleteProduct = (id) => {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      setProductList(productList.filter((p) => p.id !== id))
    }
  }

  const handleEditStock = (id, newStock) => {
    setProductList(productList.map((p) => (p.id === id ? { ...p, stock: Math.max(0, newStock) } : p)))
  }

  const handleCancel = () => {
    setIsAddingProduct(false)
    setEditingId(null)
    setFormData({
      name: "",
      category: "",
      price: "",
      stock: "",
      description: "",
    })
  }

  const stats = {
    totalProducts: productList.length,
    lowStock: productList.filter((p) => p.stock < 10).length,
    totalValue: productList.reduce((sum, p) => sum + p.price * p.stock, 0),
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Panel de Control</h1>
              <p className="text-muted-foreground mt-1">Gestiona el inventario de GCinsumos</p>
            </div>
            <button
              onClick={() => setIsAddingProduct(true)}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              + Nuevo Producto
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm text-muted-foreground font-medium mb-2">Total de Productos</p>
              <p className="text-3xl font-bold text-primary">{stats.totalProducts}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm text-muted-foreground font-medium mb-2">Stock Bajo</p>
              <p className="text-3xl font-bold text-destructive">{stats.lowStock}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm text-muted-foreground font-medium mb-2">Valor Total en Stock</p>
              <p className="text-3xl font-bold text-foreground">${Math.round(stats.totalValue / 1000000)}M</p>
            </div>
          </div>

          {/* Add/Edit Product Form */}
          {isAddingProduct && (
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-semibold text-foreground">{editingId ? "Editar" : "Nuevo"} Producto</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Nombre</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Ej: Monitor LED 27 pulgadas"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Categoría</label>
                  <input
                    type="text"
                    name="category"
                    placeholder="Ej: Monitores"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Precio</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="Ej: 29999"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    placeholder="Ej: 15"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Descripción</label>
                  <textarea
                    name="description"
                    placeholder="Describe el producto..."
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    rows="3"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddProduct}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
                >
                  {editingId ? "Guardar Cambios" : "Crear Producto"}
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-muted text-muted-foreground px-6 py-2 rounded-lg font-medium hover:bg-muted/80 transition-colors text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Products Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    <th className="px-6 py-4 text-left font-semibold text-foreground">Producto</th>
                    <th className="px-6 py-4 text-left font-semibold text-foreground">Categoría</th>
                    <th className="px-6 py-4 text-right font-semibold text-foreground">Precio</th>
                    <th className="px-6 py-4 text-center font-semibold text-foreground">Stock</th>
                    <th className="px-6 py-4 text-center font-semibold text-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">{product.name}</td>
                        <td className="px-6 py-4 text-muted-foreground">{product.category}</td>
                        <td className="px-6 py-4 text-right font-semibold text-primary">
                          ${product.price.toLocaleString("es-AR")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditStock(product.id, product.stock - 1)}
                              className="px-2 py-1 bg-muted text-muted-foreground rounded hover:bg-primary/20 transition-colors text-xs font-medium"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-semibold text-sm">{product.stock}</span>
                            <button
                              onClick={() => handleEditStock(product.id, product.stock + 1)}
                              className="px-2 py-1 bg-muted text-muted-foreground rounded hover:bg-primary/20 transition-colors text-xs font-medium"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="px-3 py-1 bg-primary/10 text-primary rounded text-xs font-medium hover:bg-primary/20 transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="px-3 py-1 bg-destructive/10 text-destructive rounded text-xs font-medium hover:bg-destructive/20 transition-colors"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                        No hay productos que coincidan con la búsqueda
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
