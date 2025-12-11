'use client'

import { useState, useEffect } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { InputNumber } from 'primereact/inputnumber'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Card } from 'primereact/card'
import { useRef } from 'react'
import Header from '../../components/Header'
import { getProducts, createProduct, updateProduct, deleteProduct, updateStock } from '@/lib/api'

export default function AdminPage() {
  const [products, setProducts] = useState([])
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
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await getProducts()
      setProducts(data)
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al cargar productos' })
    } finally {
      setLoading(false)
    }
  }

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
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData)
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Producto actualizado' })
      } else {
        await createProduct(formData)
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Producto creado' })
      }
      hideDialog()
      loadProducts()
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al guardar producto' })
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Panel de Control</h1>
              <p style={{ color: '#666' }}>Gestiona el inventario de GCinsumos</p>
            </div>
            <Button
              label="Nuevo Producto"
              icon="pi pi-plus"
              onClick={openNew}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
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

          {/* Products Table */}
          <Card>
            <DataTable
              value={products}
              loading={loading}
              paginator
              rows={10}
              emptyMessage="No hay productos"
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
        style={{ width: '450px' }}
        header={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        modal
        onHide={hideDialog}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem' }}>Nombre</label>
            <InputText
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label htmlFor="category" style={{ display: 'block', marginBottom: '0.5rem' }}>Categoría</label>
            <InputText
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label htmlFor="price" style={{ display: 'block', marginBottom: '0.5rem' }}>Precio</label>
            <InputNumber
              id="price"
              value={formData.price}
              onValueChange={(e) => setFormData({ ...formData, price: e.value })}
              mode="currency"
              currency="ARS"
              locale="es-AR"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label htmlFor="stock" style={{ display: 'block', marginBottom: '0.5rem' }}>Stock</label>
            <InputNumber
              id="stock"
              value={formData.stock}
              onValueChange={(e) => setFormData({ ...formData, stock: e.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem' }}>Descripción</label>
            <InputTextarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label htmlFor="image" style={{ display: 'block', marginBottom: '0.5rem' }}>URL de Imagen</label>
            <InputText
              id="image"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button label="Cancelar" icon="pi pi-times" onClick={hideDialog} className="p-button-text" />
            <Button label="Guardar" icon="pi pi-check" onClick={saveProduct} />
          </div>
        </div>
      </Dialog>
    </div>
  )
}
