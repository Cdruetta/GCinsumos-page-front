'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Card } from 'primereact/card'
import { Tag } from 'primereact/tag'
import Header from '@/components/Header'
import { useAuth } from '@/lib/auth-context'
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '@/lib/api'

export default function CategoriesPage() {
  const router = useRouter()
  const { isAuthenticated, mounted } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogVisible, setDialogVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true
  })
  const toast = useRef(null)

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/admin/login')
      return
    }
    if (mounted && isAuthenticated) {
      loadCategories()
    }
  }, [isAuthenticated, mounted, router])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Error al cargar categorías:', error)
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar categorías',
        life: 3000
      })
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || !isAuthenticated) {
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
          <p style={{ marginTop: '1rem', color: '#64748b' }}>Cargando...</p>
        </div>
      </div>
    )
  }

  const openNew = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      description: '',
      active: true
    })
    setDialogVisible(true)
  }

  const openEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      active: category.active
    })
    setDialogVisible(true)
  }

  const hideDialog = () => {
    setDialogVisible(false)
    setEditingCategory(null)
  }

  const saveCategory = async () => {
    if (!formData.name || !formData.name.trim()) {
      toast.current.show({
        severity: 'warn',
        summary: 'Validación',
        detail: 'El nombre de la categoría es requerido',
        life: 3000
      })
      return
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData)
        toast.current.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Categoría actualizada correctamente',
          life: 3000
        })
      } else {
        await createCategory(formData)
        toast.current.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Categoría creada correctamente',
          life: 3000
        })
      }
      hideDialog()
      loadCategories()
    } catch (error) {
      console.error('Error al guardar categoría:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Error al guardar categoría'
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 5000
      })
    }
  }

  const confirmDelete = (category) => {
    confirmDialog({
      message: `¿Estás seguro de eliminar la categoría "${category.name}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => handleDelete(category.id)
    })
  }

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id)
      toast.current.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Categoría eliminada correctamente',
        life: 3000
      })
      loadCategories()
    } catch (error) {
      console.error('Error al eliminar categoría:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Error al eliminar categoría'
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 5000
      })
    }
  }

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.active ? 'Activa' : 'Inactiva'}
        severity={rowData.active ? 'success' : 'danger'}
      />
    )
  }

  const actionsBodyTemplate = (rowData) => {
    return (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text"
          onClick={() => openEdit(rowData)}
          tooltip="Editar"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger"
          onClick={() => confirmDelete(rowData)}
          tooltip="Eliminar"
        />
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #f8fafc 100%)'
    }}>
      <Header />
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #ff7a00, #ff9f4d)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            Gestión de Categorías
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>
            Administra las categorías de productos
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>
                Lista de Categorías
              </h2>
              <Button
                label="Nueva Categoría"
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
            </div>

            <DataTable
              value={categories}
              loading={loading}
              paginator
              rows={10}
              emptyMessage="No hay categorías"
            >
              <Column field="name" header="Nombre" sortable />
              <Column field="description" header="Descripción" />
              <Column header="Estado" body={statusBodyTemplate} />
              <Column 
                field="createdAt" 
                header="Creada" 
                body={(rowData) => new Date(rowData.createdAt).toLocaleDateString('es-AR')}
                sortable 
              />
              <Column header="Acciones" body={actionsBodyTemplate} />
            </DataTable>
          </Card>
        </div>
      </div>

      {/* Category Dialog */}
      <Dialog
        visible={dialogVisible}
        style={{ width: '500px', maxWidth: '90vw' }}
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <i className={`pi ${editingCategory ? 'pi-pencil' : 'pi-plus'}`} style={{ fontSize: '1.25rem', color: '#ff7a00' }}></i>
            <span>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</span>
          </div>
        }
        modal
        onHide={hideDialog}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label htmlFor="name" style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#1e293b',
              fontSize: '0.9rem'
            }}>
              Nombre de la Categoría <span style={{ color: '#f44336' }}>*</span>
            </label>
            <InputText
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Monitores"
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
            <label htmlFor="description" style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#1e293b',
              fontSize: '0.9rem'
            }}>
              Descripción
            </label>
            <InputTextarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción opcional de la categoría..."
              rows={3}
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
            />
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
              label="Guardar" 
              icon="pi pi-check" 
              onClick={saveCategory}
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
      </Dialog>
    </div>
  )
}

