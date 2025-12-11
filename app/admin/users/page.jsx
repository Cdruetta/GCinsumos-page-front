'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Dropdown } from 'primereact/dropdown'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Card } from 'primereact/card'
import { Tag } from 'primereact/tag'
import Header from '@/components/Header'
import { useAuth } from '@/lib/auth-context'
import { useUsers, ROLES } from '@/lib/users-context'

export default function UsersPage() {
  const router = useRouter()
  const { isAuthenticated, currentUser, hasPermission, mounted } = useAuth()
  const { users, createUser, updateUser, deleteUser, toggleUserStatus, mounted: usersMounted } = useUsers()
  const [loading, setLoading] = useState(true)
  const [dialogVisible, setDialogVisible] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: ROLES.ADMIN,
    active: true
  })
  const toast = useRef(null)

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/admin/login')
      return
    }
    if (mounted && isAuthenticated) {
      // Verificar permisos - solo sudo y root pueden gestionar usuarios
      if (!hasPermission(ROLES.SUDO)) {
        toast.current?.show({
          severity: 'error',
          summary: 'Acceso denegado',
          detail: 'No tienes permisos para gestionar usuarios',
          life: 3000
        })
        setTimeout(() => router.push('/admin'), 2000)
        return
      }
      setLoading(false)
    }
  }, [isAuthenticated, mounted, hasPermission, router])

  if (!mounted || !isAuthenticated || !usersMounted) {
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

  if (!hasPermission(ROLES.SUDO)) {
    return null
  }

  const openNew = () => {
    setEditingUser(null)
    setFormData({
      username: '',
      password: '',
      role: ROLES.ADMIN,
      active: true
    })
    setDialogVisible(true)
  }

  const openEdit = (user) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      password: '', // No mostrar contraseña
      role: user.role,
      active: user.active
    })
    setDialogVisible(true)
  }

  const hideDialog = () => {
    setDialogVisible(false)
    setEditingUser(null)
  }

  const saveUser = () => {
    if (!formData.username.trim()) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'El nombre de usuario es requerido'
      })
      return
    }

    if (!editingUser && !formData.password.trim()) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'La contraseña es requerida para nuevos usuarios'
      })
      return
    }

    try {
      if (editingUser) {
        // Verificar que no se está editando a sí mismo para desactivar
        if (editingUser.id === currentUser?.id && !formData.active) {
          toast.current.show({
            severity: 'error',
            summary: 'Error',
            detail: 'No puedes desactivar tu propia cuenta'
          })
          return
        }
        updateUser(editingUser.id, formData)
        toast.current.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Usuario actualizado correctamente'
        })
      } else {
        // Verificar si el usuario ya existe
        const existingUser = users.find(u => u.username.toLowerCase() === formData.username.trim().toLowerCase())
        if (existingUser) {
          toast.current.show({
            severity: 'error',
            summary: 'Error',
            detail: 'El nombre de usuario ya existe'
          })
          return
        }
        createUser(formData.username, formData.password, formData.role)
        toast.current.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Usuario creado correctamente'
        })
      }
      hideDialog()
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al guardar usuario'
      })
    }
  }

  const confirmDelete = (user) => {
    if (user.id === currentUser?.id) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No puedes eliminar tu propia cuenta'
      })
      return
    }
    confirmDialog({
      message: `¿Estás seguro de eliminar el usuario "${user.username}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => handleDelete(user.id)
    })
  }

  const handleDelete = (id) => {
    try {
      deleteUser(id)
      toast.current.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Usuario eliminado correctamente'
      })
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al eliminar usuario'
      })
    }
  }

  const handleToggleStatus = (user) => {
    if (user.id === currentUser?.id) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No puedes desactivar tu propia cuenta'
      })
      return
    }
    toggleUserStatus(user.id)
    toast.current.show({
      severity: 'success',
      summary: 'Éxito',
      detail: `Usuario ${user.active ? 'desactivado' : 'activado'} correctamente`
    })
  }

  const roleBodyTemplate = (rowData) => {
    const roleColors = {
      [ROLES.ADMIN]: 'info',
      [ROLES.SUDO]: 'warning',
      [ROLES.ROOT]: 'danger'
    }
    const roleLabels = {
      [ROLES.ADMIN]: 'Admin',
      [ROLES.SUDO]: 'Sudo',
      [ROLES.ROOT]: 'Root'
    }
    return (
      <Tag value={roleLabels[rowData.role]} severity={roleColors[rowData.role]} />
    )
  }

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.active ? 'Activo' : 'Inactivo'}
        severity={rowData.active ? 'success' : 'danger'}
      />
    )
  }

  const actionsBodyTemplate = (rowData) => {
    const isCurrentUser = rowData.id === currentUser?.id
    return (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text"
          onClick={() => openEdit(rowData)}
          tooltip="Editar"
        />
        <Button
          icon={rowData.active ? 'pi pi-ban' : 'pi pi-check'}
          className="p-button-rounded p-button-text p-button-warning"
          onClick={() => handleToggleStatus(rowData)}
          disabled={isCurrentUser}
          tooltip={rowData.active ? 'Desactivar' : 'Activar'}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger"
          onClick={() => confirmDelete(rowData)}
          disabled={isCurrentUser}
          tooltip="Eliminar"
        />
      </div>
    )
  }

  const roleOptions = [
    { label: 'Admin', value: ROLES.ADMIN },
    { label: 'Sudo', value: ROLES.SUDO },
    { label: 'Root', value: ROLES.ROOT }
  ]

  return (
    <div>
      <Header />
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Gestión de Usuarios</h1>
              <p style={{ color: '#666' }}>Administra usuarios y permisos del sistema</p>
            </div>
            <Button
              label="Nuevo Usuario"
              icon="pi pi-plus"
              onClick={openNew}
              style={{ whiteSpace: 'nowrap' }}
            />
          </div>

          <Card>
            <DataTable
              value={users}
              loading={loading}
              paginator
              rows={10}
              emptyMessage="No hay usuarios"
            >
              <Column field="username" header="Usuario" sortable />
              <Column field="role" header="Rol" body={roleBodyTemplate} sortable />
              <Column field="active" header="Estado" body={statusBodyTemplate} />
              <Column
                field="createdAt"
                header="Fecha de Creación"
                body={(rowData) => new Date(rowData.createdAt).toLocaleDateString('es-AR')}
                sortable
              />
              <Column header="Acciones" body={actionsBodyTemplate} />
            </DataTable>
          </Card>
        </div>
      </div>

      {/* Dialog de Usuario */}
      <Dialog
        visible={dialogVisible}
        style={{ width: '450px' }}
        header={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        modal
        onHide={hideDialog}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Nombre de Usuario
            </label>
            <InputText
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              style={{ width: '100%' }}
              disabled={!!editingUser}
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Contraseña {editingUser && '(dejar vacío para no cambiar)'}
            </label>
            <Password
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              feedback={false}
              toggleMask
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label htmlFor="role" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Rol
            </label>
            <Dropdown
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.value })}
              options={roleOptions}
              placeholder="Selecciona un rol"
              style={{ width: '100%' }}
              disabled={currentUser?.role !== ROLES.ROOT && editingUser?.role === ROLES.ROOT}
            />
            <small style={{ color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
              Root: Acceso total | Sudo: Puede gestionar usuarios | Admin: Acceso básico
            </small>
          </div>

          {editingUser && (
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  disabled={editingUser.id === currentUser?.id}
                />
                <span style={{ fontWeight: '600' }}>Usuario activo</span>
              </label>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button label="Cancelar" icon="pi pi-times" onClick={hideDialog} className="p-button-text" />
            <Button label="Guardar" icon="pi pi-check" onClick={saveUser} />
          </div>
        </div>
      </Dialog>
    </div>
  )
}

