'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { InputNumber } from 'primereact/inputnumber'
import { Dropdown } from 'primereact/dropdown'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Card } from 'primereact/card'
import { useRef } from 'react'
import Header from '../../components/Header'
import { useAuth } from '@/lib/auth-context'
import { ROLES } from '@/lib/users-context'
import { categories } from '@/lib/products-data'
import { getProducts, createProduct, updateProduct, deleteProduct, updateStock } from '@/lib/api'

const PRODUCT_CATEGORIES = categories.filter(cat => cat !== 'Todos')

// Función helper para obtener la URL completa de la imagen
const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder.svg'
  
  // Si ya es una URL completa (http/https), usarla directamente
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // Si es una ruta relativa que empieza con /, asumir que está en el backend
  if (imagePath.startsWith('/')) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    return `${API_URL}${imagePath}`
  }
  
  // Si es una ruta relativa sin /, agregar / y usar el backend
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  return `${API_URL}/${imagePath}`
}

export default function AdminPage() {
  const router = useRouter()
  const { isAuthenticated, logout, hasPermission, mounted } = useAuth()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogVisible, setDialogVisible] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: 0,
    stock: 0,
    description: '',
    image: ''
  })
  const toast = useRef(null)

  useEffect(() => {
    if (mounted && isAuthenticated) {
      loadProducts()
    }
    // Si está montado pero no autenticado, redirigir al home
    if (mounted && !isAuthenticated && typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }, [isAuthenticated, mounted])

  // Mostrar loading mientras se verifica la autenticación
  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #f8fafc 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#ff7a00' }}></i>
          <p style={{ marginTop: '1rem', color: '#64748b' }}>Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado después de montar, mostrar mensaje de redirección
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #f8fafc 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem', color: '#ff7a00' }}></i>
          <p style={{ marginTop: '1rem', color: '#64748b' }}>Redirigiendo al home...</p>
        </div>
      </div>
    )
  }

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await getProducts()
      setProducts(data)
      setFilteredProducts(data)
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al cargar productos' })
    } finally {
      setLoading(false)
    }
  }

  // Filtrar productos por búsqueda
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products)
      return
    }

    const query = searchQuery.toLowerCase().trim()
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.price.toString().includes(query)
    )
    setFilteredProducts(filtered)
  }, [searchQuery, products])

  const openNew = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      category: '',
      price: 0,
      stock: 0,
      description: '',
      image: ''
    })
    setDialogVisible(true)
  }

  const openEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      description: product.description,
      image: product.image || ''
    })
    setDialogVisible(true)
  }

  const hideDialog = () => {
    setDialogVisible(false)
  }

  const saveProduct = async () => {
    // Validaciones
    if (!formData.name || !formData.name.trim()) {
      toast.current.show({ 
        severity: 'error', 
        summary: 'Error de validación', 
        detail: 'El nombre del producto es requerido' 
      })
      return
    }

    if (!formData.category || !formData.category.trim()) {
      toast.current.show({ 
        severity: 'error', 
        summary: 'Error de validación', 
        detail: 'La categoría es requerida' 
      })
      return
    }

    if (!formData.description || !formData.description.trim()) {
      toast.current.show({ 
        severity: 'error', 
        summary: 'Error de validación', 
        detail: 'La descripción es requerida' 
      })
      return
    }

    if (!formData.price || formData.price <= 0) {
      toast.current.show({ 
        severity: 'error', 
        summary: 'Error de validación', 
        detail: 'El precio debe ser mayor a 0' 
      })
      return
    }

    if (formData.stock < 0) {
      toast.current.show({ 
        severity: 'error', 
        summary: 'Error de validación', 
        detail: 'El stock no puede ser negativo' 
      })
      return
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData)
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Producto actualizado correctamente' })
      } else {
        await createProduct(formData)
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Producto creado correctamente' })
      }
      hideDialog()
      loadProducts()
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al guardar producto. Verifica la conexión con el backend.' })
    }
  }

  const confirmDelete = (product) => {
    confirmDialog({
      message: `¿Estás seguro de eliminar ${product.name}?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => handleDelete(product.id)
    })
  }

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id)
      toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Producto eliminado' })
      loadProducts()
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al eliminar producto' })
    }
  }

  const handleStockChange = async (product, newStock) => {
    try {
      await updateStock(product.id, newStock)
      loadProducts()
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al actualizar stock' })
    }
  }

  const priceBodyTemplate = (rowData) => {
    return `$${rowData.price.toLocaleString('es-AR')}`
  }

  const stockBodyTemplate = (rowData) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Button
          icon="pi pi-minus"
          className="p-button-rounded p-button-text p-button-sm"
          onClick={() => handleStockChange(rowData, Math.max(0, rowData.stock - 1))}
        />
        <span style={{ minWidth: '30px', textAlign: 'center' }}>{rowData.stock}</span>
        <Button
          icon="pi pi-plus"
          className="p-button-rounded p-button-text p-button-sm"
          onClick={() => handleStockChange(rowData, rowData.stock + 1)}
        />
      </div>
    )
  }

  const actionsBodyTemplate = (rowData) => {
    return (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text"
          onClick={() => openEdit(rowData)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger"
          onClick={() => confirmDelete(rowData)}
        />
      </div>
    )
  }

  const stats = {
    totalProducts: products.length,
    lowStock: products.filter(p => p.stock < 10).length,
    totalValue: products.reduce((sum, p) => sum + p.price * p.stock, 0)
  }

  return (
    <div>
      <Header />
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <div 
            className="admin-header"
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Panel de Control</h1>
              <p style={{ color: '#666' }}>Gestiona el inventario de GCinsumos</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Button
                label="Nuevo Producto"
                icon="pi pi-plus"
                onClick={openNew}
                style={{ whiteSpace: 'nowrap' }}
              />
              {hasPermission && hasPermission(ROLES.SUDO) && (
                <Button
                  label="Usuarios"
                  icon="pi pi-users"
                  className="p-button-outlined"
                  onClick={() => router.push('/admin/users')}
                  style={{ whiteSpace: 'nowrap' }}
                />
              )}
              <Button
                label="Cerrar Sesión"
                icon="pi pi-sign-out"
                className="p-button-outlined p-button-danger"
                onClick={async () => {
                  // Primero hacer logout
                  logout()
                  // Esperar un momento para que el estado se actualice
                  await new Promise(resolve => setTimeout(resolve, 100))
                  // Redirigir al home usando window.location para forzar recarga completa
                  if (typeof window !== 'undefined') {
                    window.location.href = '/'
                  }
                }}
                style={{ whiteSpace: 'nowrap' }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 admin-stats" style={{ marginBottom: '2rem' }}>
            <Card>
              <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Total de Productos</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2196F3' }}>{stats.totalProducts}</p>
            </Card>
            <Card>
              <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Stock Bajo</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f44336' }}>{stats.lowStock}</p>
            </Card>
            <Card>
              <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Valor Total en Stock</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>${Math.round(stats.totalValue / 1000000)}M</p>
            </Card>
          </div>

          {/* Búsqueda de productos */}
          <Card style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <label htmlFor="admin-search" style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '600',
                  color: '#1e293b',
                  fontSize: '0.9rem'
                }}>
                  Buscar Productos
                </label>
                <span className="p-input-icon-left" style={{ width: '100%', display: 'block' }}>
                  <i className="pi pi-search" style={{ color: '#64748b', left: '0.75rem' }}></i>
                  <InputText
                    id="admin-search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre, categoría, descripción o precio..."
                    style={{
                      width: '100%',
                      paddingLeft: '2.5rem',
                      borderRadius: '12px',
                      border: '2px solid #e2e8f0',
                      padding: '0.75rem 1rem 0.75rem 2.5rem',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#ff7a00'
                      e.target.style.boxShadow = '0 0 0 3px rgba(255, 122, 0, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </span>
              </div>
              {searchQuery && (
                <Button
                  label="Limpiar"
                  icon="pi pi-times"
                  className="p-button-outlined"
                  onClick={() => setSearchQuery('')}
                  style={{ marginTop: '1.75rem' }}
                />
              )}
            </div>
            {searchQuery && (
              <p style={{ marginTop: '0.75rem', color: '#64748b', fontSize: '0.875rem' }}>
                Mostrando {filteredProducts.length} de {products.length} productos
              </p>
            )}
          </Card>

          {/* Products Table */}
          <Card>
            <DataTable
              value={filteredProducts}
              loading={loading}
              paginator
              rows={10}
              emptyMessage={searchQuery ? "No se encontraron productos" : "No hay productos"}
              globalFilter={searchQuery}
            >
              <Column field="name" header="Producto" sortable />
              <Column field="category" header="Categoría" sortable />
              <Column field="price" header="Precio" body={priceBodyTemplate} sortable />
              <Column field="stock" header="Stock" body={stockBodyTemplate} />
              <Column header="Acciones" body={actionsBodyTemplate} />
            </DataTable>
          </Card>
        </div>
      </div>

      {/* Product Dialog */}
      <Dialog
        visible={dialogVisible}
        style={{ width: '500px', maxWidth: '90vw' }}
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <i className={`pi ${editingProduct ? 'pi-pencil' : 'pi-plus'}`} style={{ fontSize: '1.25rem', color: '#ff7a00' }}></i>
            <span>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</span>
          </div>
        }
        modal
        onHide={hideDialog}
        className="product-dialog"
      >
        <form onSubmit={(e) => { e.preventDefault(); saveProduct(); }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label htmlFor="name" style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#1e293b',
                fontSize: '0.9rem'
              }}>
                Nombre del Producto <span style={{ color: '#f44336' }}>*</span>
              </label>
              <InputText
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Monitor LED 27 pulgadas"
                style={{ 
                  width: '100%',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  padding: '0.75rem 1rem',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ff7a00'
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 122, 0, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                }}
                required
              />
            </div>

            <div>
              <label htmlFor="category" style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#1e293b',
                fontSize: '0.9rem'
              }}>
                Categoría <span style={{ color: '#f44336' }}>*</span>
              </label>
              <Dropdown
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.value })}
                options={PRODUCT_CATEGORIES.map(cat => ({ label: cat, value: cat }))}
                placeholder="Selecciona una categoría"
                style={{ 
                  width: '100%',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0'
                }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label htmlFor="price" style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  fontSize: '0.9rem'
                }}>
                  Precio (ARS) <span style={{ color: '#f44336' }}>*</span>
                </label>
                <InputNumber
                  id="price"
                  value={formData.price}
                  onValueChange={(e) => setFormData({ ...formData, price: e.value || 0 })}
                  mode="currency"
                  currency="ARS"
                  locale="es-AR"
                  min={0}
                  style={{ 
                    width: '100%',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0'
                  }}
                  required
                />
              </div>

              <div>
                <label htmlFor="stock" style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  fontSize: '0.9rem'
                }}>
                  Stock <span style={{ color: '#f44336' }}>*</span>
                </label>
                <InputNumber
                  id="stock"
                  value={formData.stock}
                  onValueChange={(e) => setFormData({ ...formData, stock: e.value || 0 })}
                  min={0}
                  style={{ 
                    width: '100%',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0'
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#1e293b',
                fontSize: '0.9rem'
              }}>
                Descripción <span style={{ color: '#f44336' }}>*</span>
              </label>
              <InputTextarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe las características principales del producto..."
                rows={4}
                style={{ 
                  width: '100%',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  padding: '0.75rem 1rem',
                  fontSize: '1rem',
                  resize: 'vertical',
                  transition: 'all 0.3s ease',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ff7a00'
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 122, 0, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                }}
                required
              />
            </div>

            <div>
              <label htmlFor="image" style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#1e293b',
                fontSize: '0.9rem'
              }}>
                URL de Imagen
              </label>
              <InputText
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="/imagen-producto.jpg o https://..."
                style={{ 
                  width: '100%',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  padding: '0.75rem 1rem',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ff7a00'
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 122, 0, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                }}
              />
              {formData.image && (
                <div style={{ marginTop: '0.5rem' }}>
                  <img 
                    src={getImageUrl(formData.image)} 
                    alt="Vista previa" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '150px', 
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      console.error('Error cargando imagen de vista previa:', formData.image, 'URL generada:', getImageUrl(formData.image))
                      e.target.style.display = 'none'
                      e.target.onerror = null // Evitar loop infinito
                    }}
                    onLoad={() => {
                      console.log('Imagen cargada exitosamente:', getImageUrl(formData.image))
                    }}
                  />
                </div>
              )}
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '0.75rem', 
              marginTop: '0.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid #e2e8f0'
            }}>
              <Button 
                label="Cancelar" 
                icon="pi pi-times" 
                onClick={hideDialog} 
                className="p-button-outlined"
                style={{
                  borderRadius: '12px',
                  padding: '0.6rem 1.2rem'
                }}
              />
              <Button 
                type="submit"
                label="Guardar" 
                icon="pi pi-check" 
                onClick={saveProduct}
                style={{
                  background: 'linear-gradient(135deg, #ff7a00, #ff9f4d)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.6rem 1.2rem',
                  fontWeight: 600
                }}
              />
            </div>
          </div>
        </form>
      </Dialog>
    </div>
  )
}

