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
import { getProducts, createProduct, updateProduct, deleteProduct, updateStock, getProductCategories, uploadImage } from '@/lib/api'

// PRODUCT_CATEGORIES se cargará dinámicamente desde la API

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
  const [productCategories, setProductCategories] = useState([])
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
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef(null)
  const toast = useRef(null)

  useEffect(() => {
    if (mounted && isAuthenticated) {
      loadCategories()
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

  const loadCategories = async () => {
    try {
      const data = await getProductCategories()
      // Filtrar 'Todos' y usar solo las categorías reales
      setProductCategories(data.filter(cat => cat !== 'Todos'))
    } catch (error) {
      console.error('Error al cargar categorías:', error)
      // Fallback a categorías hardcodeadas
      setProductCategories(categories.filter(cat => cat !== 'Todos'))
    }
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

  // Filtrar productos por búsqueda (optimizado para evitar parpadeo)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products)
      return
    }

    // Usar debounce para evitar filtrado excesivo mientras se escribe
    const timeoutId = setTimeout(() => {
      const query = searchQuery.toLowerCase().trim()
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.price.toString().includes(query)
      )
      setFilteredProducts(filtered)
    }, 200) // Pequeño debounce para suavizar el filtrado

    return () => clearTimeout(timeoutId)
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
                style={{ 
                  whiteSpace: 'nowrap',
                  padding: '0.75rem 1.5rem',
                  minHeight: '44px',
                  fontSize: '0.95rem',
                  fontWeight: 500
                }}
              />
              <Button
                label="Categorías"
                icon="pi pi-tags"
                className="p-button-outlined"
                onClick={() => router.push('/admin/categories')}
                style={{ 
                  whiteSpace: 'nowrap',
                  padding: '0.75rem 1.5rem',
                  minHeight: '44px',
                  fontSize: '0.95rem',
                  fontWeight: 500
                }}
              />
              {hasPermission && (hasPermission(ROLES.ADMIN) || hasPermission(ROLES.SUDO)) && (
                <Button
                  label="Usuarios"
                  icon="pi pi-users"
                  className="p-button-outlined"
                  onClick={() => router.push('/admin/users')}
                  style={{ 
                    whiteSpace: 'nowrap',
                    padding: '0.75rem 1.5rem',
                    minHeight: '44px',
                    fontSize: '0.95rem',
                    fontWeight: 500
                  }}
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
                style={{ 
                  whiteSpace: 'nowrap',
                  padding: '0.75rem 1.5rem',
                  minHeight: '44px',
                  fontSize: '0.95rem',
                  fontWeight: 500
                }}
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
                  style={{ 
                    marginTop: '1.75rem',
                    padding: '0.625rem 1.25rem',
                    minHeight: '40px',
                    fontSize: '0.9rem'
                  }}
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
              loading={loading && products.length === 0}
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
                options={productCategories.length > 0 
                  ? productCategories.map(cat => ({ label: cat, value: cat }))
                  : categories.filter(cat => cat !== 'Todos').map(cat => ({ label: cat, value: cat }))
                }
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
                Imagen del Producto
              </label>
              
              {/* Opción 1: Subir archivo desde la computadora */}
              <div style={{
                marginBottom: '1rem',
                padding: '1rem',
                background: '#f0f9ff',
                borderRadius: '12px',
                border: '2px dashed #3b82f6'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <i className="pi pi-upload" style={{ fontSize: '1.5rem', color: '#3b82f6' }}></i>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>
                      Subir imagen desde tu computadora
                    </p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>
                      Selecciona un archivo de imagen (JPG, PNG, GIF, WEBP - máximo 5MB)
                    </p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,image/bmp"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return

                    // Validar tamaño (5MB)
                    if (file.size > 5 * 1024 * 1024) {
                      toast.current.show({
                        severity: 'error',
                        summary: 'Archivo muy grande',
                        detail: 'El archivo no puede ser mayor a 5MB',
                        life: 4000
                      })
                      e.target.value = ''
                      return
                    }

                    try {
                      setUploadingImage(true)
                      toast.current.show({
                        severity: 'info',
                        summary: 'Subiendo imagen...',
                        detail: 'Por favor espera',
                        life: 2000
                      })

                      const result = await uploadImage(file)
                      setFormData({ ...formData, image: result.imagePath })
                      
                      toast.current.show({
                        severity: 'success',
                        summary: 'Imagen subida',
                        detail: 'La imagen se ha subido correctamente',
                        life: 3000
                      })
                    } catch (error) {
                      console.error('Error al subir imagen:', error)
                      toast.current.show({
                        severity: 'error',
                        summary: 'Error al subir',
                        detail: error.response?.data?.error || error.message || 'No se pudo subir la imagen',
                        life: 5000
                      })
                    } finally {
                      setUploadingImage(false)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }
                  }}
                  style={{ display: 'none' }}
                  disabled={uploadingImage}
                />
                <Button
                  label={uploadingImage ? 'Subiendo...' : 'Seleccionar archivo'}
                  icon={uploadingImage ? 'pi pi-spin pi-spinner' : 'pi pi-upload'}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  style={{
                    width: '100%',
                    background: uploadingImage 
                      ? '#cbd5e1' 
                      : 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 600,
                    padding: '0.75rem 1.5rem',
                    borderRadius: '12px'
                  }}
                />
              </div>

              {/* Separador */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                margin: '1rem 0',
                color: '#94a3b8'
              }}>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>O</span>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
              </div>

              {/* Opción 2: Pegar URL */}
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <InputText
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="Pega aquí la URL de la imagen (https://...) o ruta local (/uploads/...)"
                  style={{ 
                    flex: 1,
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
                    const url = e.target.value
                    const isValid = !url || url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')
                    e.target.style.borderColor = isValid ? '#e2e8f0' : '#f59e0b'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <Button
                  icon="pi pi-paste"
                  label="Pegar URL"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText()
                      if (text && (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('/'))) {
                        setFormData({ ...formData, image: text })
                        toast.current.show({
                          severity: 'success',
                          summary: 'URL pegada',
                          detail: 'URL de imagen pegada desde el portapapeles',
                          life: 2000
                        })
                      } else {
                        toast.current.show({
                          severity: 'warn',
                          summary: 'URL inválida',
                          detail: 'El portapapeles no contiene una URL válida',
                          life: 3000
                        })
                      }
                    } catch (err) {
                      toast.current.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudo leer el portapapeles. Usa Ctrl+V para pegar manualmente.',
                        life: 3000
                      })
                    }
                  }}
                  className="p-button-outlined"
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '0.75rem 1rem'
                  }}
                />
                {formData.image && (
                  <Button
                    icon="pi pi-times"
                    onClick={() => setFormData({ ...formData, image: '' })}
                    className="p-button-outlined p-button-danger"
                    style={{
                      padding: '0.75rem 1rem'
                    }}
                    tooltip="Limpiar imagen"
                    tooltipOptions={{ position: 'top' }}
                  />
                )}
              </div>
              
              {/* Instrucciones */}
              <div style={{
                marginBottom: '0.75rem',
                padding: '0.75rem',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.875rem', 
                  color: '#64748b',
                  lineHeight: 1.5
                }}>
                  <strong style={{ color: '#1e293b' }}>💡 Cómo obtener la URL de una imagen:</strong>
                </p>
                <ol style={{ 
                  margin: '0.5rem 0 0 0', 
                  paddingLeft: '1.25rem',
                  fontSize: '0.875rem',
                  color: '#64748b',
                  lineHeight: 1.6
                }}>
                  <li>Haz clic derecho en la imagen que quieres usar</li>
                  <li>Selecciona "Copiar dirección de imagen" o "Copy image address"</li>
                  <li>Pega la URL aquí o usa el botón "Pegar URL"</li>
                </ol>
                <p style={{ 
                  margin: '0.5rem 0 0 0', 
                  fontSize: '0.875rem', 
                  color: '#f59e0b',
                  fontWeight: 500
                }}>
                  ⚠️ Asegúrate de usar la URL directa de la imagen, no la URL de una página web
                </p>
              </div>

              {/* Vista previa */}
              {formData.image && (
                <div style={{ 
                  marginTop: '0.75rem',
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <p style={{ 
                    margin: '0 0 0.75rem 0', 
                    fontSize: '0.875rem', 
                    fontWeight: 600,
                    color: '#1e293b'
                  }}>
                    Vista previa:
                  </p>
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    maxHeight: '200px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#fff',
                    border: '2px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img 
                      src={getImageUrl(formData.image)} 
                      alt="Vista previa" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '200px', 
                        borderRadius: '6px',
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        console.error('❌ Error cargando imagen de vista previa:', formData.image)
                        e.target.style.display = 'none'
                        e.target.onerror = null
                        const errorDiv = e.target.parentElement.querySelector('.preview-error')
                        if (!errorDiv) {
                          const div = document.createElement('div')
                          div.className = 'preview-error'
                          div.style.cssText = 'padding: 2rem; text-align: center; color: #ef4444;'
                          div.innerHTML = '<i class="pi pi-exclamation-triangle" style="font-size: 2rem; display: block; margin-bottom: 0.5rem;"></i><p style="margin: 0; font-size: 0.875rem;">No se pudo cargar la imagen. Verifica que la URL sea correcta.</p>'
                          e.target.parentElement.appendChild(div)
                        }
                      }}
                      onLoad={(e) => {
                        console.log('✅ Vista previa cargada exitosamente')
                        const errorDiv = e.target.parentElement.querySelector('.preview-error')
                        if (errorDiv) errorDiv.remove()
                      }}
                    />
                  </div>
                  <p style={{ 
                    margin: '0.5rem 0 0 0', 
                    fontSize: '0.75rem', 
                    color: '#64748b',
                    wordBreak: 'break-all'
                  }}>
                    URL: {formData.image}
                  </p>
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
                  padding: '0.75rem 1.5rem',
                  minHeight: '44px',
                  fontSize: '0.95rem',
                  fontWeight: 500
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
                  padding: '0.75rem 1.5rem',
                  fontWeight: 600,
                  minHeight: '44px',
                  fontSize: '0.95rem',
                  boxShadow: '0 2px 8px rgba(255, 122, 0, 0.25)'
                }}
              />
            </div>
          </div>
        </form>
      </Dialog>
    </div>
  )
}

