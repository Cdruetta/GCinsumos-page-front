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
  const { users, createUser, updateUser, deleteUser, toggleUserStatus, loadUsers, mounted: usersMounted, loading: usersLoading } = useUsers()
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
      // Todos los usuarios ADMIN pueden gestionar usuarios
      // Cargar usuarios desde la API cuando la página se monta
      if (loadUsers && usersMounted) {
        loadUsers().then(() => {
          console.log('✅ Usuarios cargados desde la DB:', users.length)
          setLoading(false)
        }).catch((error) => {
          console.error('❌ Error al cargar usuarios:', error)
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar usuarios desde la base de datos',
            life: 5000
          })
          setLoading(false)
        })
      } else if (usersMounted) {
        // Si ya están cargados, solo actualizar el estado
        console.log('📋 Usuarios ya cargados:', users.length)
        setLoading(false)
      }
    }
  }, [isAuthenticated, mounted, hasPermission, router, loadUsers, usersMounted, users.length])
  
  // Efecto adicional para recargar cuando cambien los usuarios del contexto
  useEffect(() => {
    if (usersMounted && users.length > 0) {
      console.log('👥 Usuarios disponibles:', users.map(u => ({ id: u.id, username: u.username, role: u.role })))
    }
  }, [users, usersMounted])

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

  // Todos los usuarios ADMIN pueden gestionar usuarios
  const canManageUsers = hasPermission && hasPermission(ROLES.ADMIN)

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

  const saveUser = async () => {
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
        await updateUser(editingUser.id, formData)
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
        await createUser(formData.username, formData.password, formData.role)
        toast.current.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Usuario creado correctamente'
        })
      }
      hideDialog()
      // Recargar usuarios desde la API
      if (loadUsers) {
        await loadUsers()
      }
    } catch (error) {
      console.error('Error al guardar usuario:', error)
      console.error('Error completo:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      
      let errorMessage = 'Error al guardar usuario'
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }
      
      // Mensajes especiales para errores comunes
      if (error.response?.data?.code === 'TABLE_NOT_EXISTS') {
        errorMessage = '⚠️ La base de datos no está configurada. Ejecuta la migración en el backend: npx prisma migrate dev'
      } else if (error.response?.data?.code === 'SCHEMA_MISMATCH') {
        errorMessage = '⚠️ La estructura de la base de datos no coincide. Ejecuta: npx prisma db push'
      } else if (error.response?.data?.code === 'DB_CONNECTION_ERROR') {
        errorMessage = '⚠️ No se puede conectar a la base de datos. Verifica que el backend esté corriendo.'
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        errorMessage = '⚠️ No se puede conectar al servidor. Verifica que el backend esté corriendo en ' + (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')
      }
      
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 8000
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

  const handleDelete = async (id) => {
    try {
      await deleteUser(id)
      toast.current.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Usuario eliminado correctamente'
      })
      // Recargar usuarios desde la API
      if (loadUsers) {
        await loadUsers()
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Error al eliminar usuario'
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage
      })
    }
  }

  const handleToggleStatus = async (user) => {
    if (user.id === currentUser?.id) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No puedes desactivar tu propia cuenta'
      })
      return
    }
    try {
      await toggleUserStatus(user.id)
      toast.current.show({
        severity: 'success',
        summary: 'Éxito',
        detail: `Usuario ${user.active ? 'desactivado' : 'activado'} correctamente`
      })
      // Recargar usuarios desde la API
      if (loadUsers) {
        await loadUsers()
      }
    } catch (error) {
      console.error('Error al cambiar estado de usuario:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Error al cambiar estado'
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage
      })
    }
  }

  const roleBodyTemplate = (rowData) => {
    const roleColors = {
      [ROLES.ADMIN]: 'info'
    }
    const roleLabels = {
      [ROLES.ADMIN]: 'Admin'
    }
    return (
      <Tag value={roleLabels[rowData.role] || 'Admin'} severity={roleColors[rowData.role] || 'info'} />
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
          disabled={!canManageUsers || isCurrentUser}
          tooltip={isCurrentUser ? 'No puedes editar tu propia cuenta' : 'Editar'}
        />
        <Button
          icon={rowData.active ? 'pi pi-ban' : 'pi pi-check'}
          className="p-button-rounded p-button-text p-button-warning"
          onClick={() => handleToggleStatus(rowData)}
          disabled={!canManageUsers || isCurrentUser}
          tooltip={isCurrentUser ? 'No puedes desactivar tu propia cuenta' : (rowData.active ? 'Desactivar' : 'Activar')}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger"
          onClick={() => confirmDelete(rowData)}
          disabled={!canManageUsers || isCurrentUser}
          tooltip={isCurrentUser ? 'No puedes eliminar tu propia cuenta' : 'Eliminar'}
        />
      </div>
    )
  }

  const roleOptions = [
    { label: 'Admin', value: ROLES.ADMIN }
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
              disabled={!canManageUsers}
              style={{ 
                whiteSpace: 'nowrap',
                padding: '0.75rem 1.5rem',
                minHeight: '44px',
                fontSize: '0.95rem',
                fontWeight: 500,
                opacity: canManageUsers ? 1 : 0.5
              }}
            />
          </div>

          <Card>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                Total de usuarios: <strong style={{ color: '#1e293b' }}>{users.length}</strong>
              </p>
              {users.length === 0 && !loading && (
                <p style={{ margin: 0, color: '#f59e0b', fontSize: '0.875rem' }}>
                  ⚠️ No hay usuarios en la base de datos
                </p>
              )}
            </div>
            <DataTable
              value={users || []}
              loading={loading || usersLoading}
              paginator
              rows={10}
              emptyMessage={loading || usersLoading ? "Cargando usuarios desde la base de datos..." : "No hay usuarios. Crea uno nuevo para comenzar."}
            >
              <Column 
                field="id" 
                header="ID" 
                sortable 
                style={{ width: '80px' }}
                body={(rowData) => rowData.id || 'N/A'}
              />
              <Column field="username" header="Usuario" sortable />
              <Column field="role" header="Rol" body={roleBodyTemplate} sortable />
              <Column field="active" header="Estado" body={statusBodyTemplate} />
              <Column
                field="createdAt"
                header="Fecha de Creación"
                body={(rowData) => {
                  if (!rowData.createdAt) return 'N/A'
                  try {
                    return new Date(rowData.createdAt).toLocaleDateString('es-AR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  } catch (e) {
                    return 'N/A'
                  }
                }}
                sortable
              />
              <Column header="Acciones" body={actionsBodyTemplate} style={{ width: '150px' }} />
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
            />
            <small style={{ color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
              Admin: Acceso completo al sistema
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
              onClick={saveUser}
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

