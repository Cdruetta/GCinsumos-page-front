"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { getUsers, createUser as createUserAPI, updateUser as updateUserAPI, deleteUser as deleteUserAPI } from './api'

const USERS_STORAGE_KEY = "gcinsumos_users"
export const UsersContext = createContext()

// Roles disponibles
export const ROLES = {
  ADMIN: 'admin',
  SUDO: 'sudo',
  ROOT: 'root'
}

// Función simple para hash de contraseña (mismo que en el backend)
const simpleHash = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString()
}

export function UsersProvider({ children }) {
  const [users, setUsers] = useState([])
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  // Cargar usuarios desde la API
  const loadUsers = async () => {
    try {
      setLoading(true)
      const usersData = await getUsers()
      setUsers(usersData)
      // También guardar en localStorage como backup
      if (typeof window !== 'undefined') {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersData))
      }
    } catch (error) {
      console.error("Error al cargar usuarios desde la API:", error)
      // Fallback a localStorage si la API falla
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem(USERS_STORAGE_KEY)
          if (stored) {
            const parsed = JSON.parse(stored)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setUsers(parsed)
            }
          }
        } catch (localError) {
          console.error("Error al cargar usuarios desde localStorage:", localError)
        }
      }
    } finally {
      setLoading(false)
      setMounted(true)
    }
  }

  // Inicializar usuarios desde la API
  useEffect(() => {
    if (typeof window === 'undefined') return
    loadUsers()
  }, [])

  const createUser = async (username, password, role) => {
    try {
      console.log('Intentando crear usuario:', { username, role })
      const newUser = await createUserAPI({
        username: username.trim(),
        password: password.trim(),
        role: role || ROLES.ADMIN,
        active: true
      })
      
      console.log('Usuario creado exitosamente:', newUser)
      setUsers(prev => [...prev, newUser])
      
      // Actualizar localStorage como backup
      if (typeof window !== 'undefined') {
        try {
          const updated = [...users, newUser]
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated))
        } catch (error) {
          console.error("Error al guardar en localStorage:", error)
        }
      }
      
      return newUser
    } catch (error) {
      console.error("Error al crear usuario:", error)
      console.error("Detalles del error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      })
      throw error
    }
  }

  const updateUser = async (id, updates) => {
    try {
      // Preparar datos para la API
      const updateData = {}
      if (updates.username !== undefined) updateData.username = updates.username.trim()
      if (updates.role !== undefined) updateData.role = updates.role
      if (updates.active !== undefined) updateData.active = updates.active
      if (updates.password !== undefined && updates.password.trim() !== '') {
        updateData.password = updates.password.trim()
      }

      const updatedUser = await updateUserAPI(id, updateData)
      
      setUsers(prev => prev.map(user => 
        user.id === id ? updatedUser : user
      ))
      
      // Actualizar localStorage como backup
      if (typeof window !== 'undefined') {
        try {
          const updated = users.map(user => user.id === id ? updatedUser : user)
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated))
        } catch (error) {
          console.error("Error al guardar en localStorage:", error)
        }
      }
      
      return updatedUser
    } catch (error) {
      console.error("Error al actualizar usuario:", error)
      throw error
    }
  }

  const deleteUser = async (id) => {
    try {
      await deleteUserAPI(id)
      
      setUsers(prev => prev.filter(user => user.id !== id))
      
      // Actualizar localStorage como backup
      if (typeof window !== 'undefined') {
        try {
          const updated = users.filter(user => user.id !== id)
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated))
        } catch (error) {
          console.error("Error al guardar en localStorage:", error)
        }
      }
    } catch (error) {
      console.error("Error al eliminar usuario:", error)
      throw error
    }
  }

  const toggleUserStatus = async (id) => {
    try {
      const user = users.find(u => u.id === id)
      if (!user) throw new Error('Usuario no encontrado')
      
      const updatedUser = await updateUserAPI(id, { active: !user.active })
      
      setUsers(prev => prev.map(user => 
        user.id === id ? updatedUser : user
      ))
      
      // Actualizar localStorage como backup
      if (typeof window !== 'undefined') {
        try {
          const updated = users.map(user => user.id === id ? updatedUser : user)
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated))
        } catch (error) {
          console.error("Error al guardar en localStorage:", error)
        }
      }
    } catch (error) {
      console.error("Error al cambiar estado de usuario:", error)
      throw error
    }
  }

  const getUserByUsername = (username) => {
    return users.find(user => user.username === username.trim())
  }

  const verifyPassword = (username, password) => {
    const user = getUserByUsername(username)
    if (!user || !user.active) return null
    const passwordHash = simpleHash(password.trim())
    // Nota: En producción, esto debería verificar contra la API
    // Por ahora, mantenemos la verificación local para compatibilidad
    // pero los usuarios se cargan desde la DB
    if (user.passwordHash === passwordHash) {
      return user
    }
    return null
  }

  const hasPermission = (userRole, requiredRole) => {
    const roleHierarchy = {
      [ROLES.ADMIN]: 1,
      [ROLES.SUDO]: 2,
      [ROLES.ROOT]: 3
    }
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
  }

  return (
    <UsersContext.Provider
      value={{
        users,
        createUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        getUserByUsername,
        verifyPassword,
        hasPermission,
        mounted,
        loading,
        loadUsers, // Exponer función para recargar usuarios
      }}
    >
      {children}
    </UsersContext.Provider>
  )
}

export function useUsers() {
  const context = useContext(UsersContext)
  if (!context) {
    throw new Error("useUsers must be used within UsersProvider")
  }
  return context
}
