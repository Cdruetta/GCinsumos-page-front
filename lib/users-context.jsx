"use client"

import { createContext, useContext, useState, useEffect } from "react"

const USERS_STORAGE_KEY = "gcinsumos_users"
export const UsersContext = createContext()

// Roles disponibles
export const ROLES = {
  ADMIN: 'admin',
  SUDO: 'sudo',
  ROOT: 'root'
}

// Usuario inicial (root)
const INITIAL_USERS = [
  {
    id: '1',
    username: 'neondb_owner',
    passwordHash: '', // Se calculará al iniciar
    role: ROLES.ROOT,
    createdAt: new Date().toISOString(),
    active: true
  }
]

// Función simple para hash de contraseña
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

  // Inicializar usuarios desde localStorage
  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setUsers(parsed)
        } else {
          // Inicializar con usuario root si no hay usuarios
          const initialUsers = [...INITIAL_USERS]
          initialUsers[0].passwordHash = simpleHash('npg_WKSC8uHL5xeB')
          setUsers(initialUsers)
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers))
        }
      } else {
        // Primera vez: crear usuario root inicial
        const initialUsers = [...INITIAL_USERS]
        initialUsers[0].passwordHash = simpleHash('npg_WKSC8uHL5xeB')
        setUsers(initialUsers)
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers))
      }
    } catch (error) {
      console.error("Error al cargar usuarios", error)
      const initialUsers = [...INITIAL_USERS]
      initialUsers[0].passwordHash = simpleHash('npg_WKSC8uHL5xeB')
      setUsers(initialUsers)
    }
  }, [])

  // Persistir usuarios
  useEffect(() => {
    if (!mounted || users.length === 0) return
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
    } catch (error) {
      console.error("Error al guardar usuarios", error)
    }
  }, [users, mounted])

  const createUser = (username, password, role) => {
    const newUser = {
      id: Date.now().toString(),
      username: username.trim(),
      passwordHash: simpleHash(password.trim()),
      role: role || ROLES.ADMIN,
      createdAt: new Date().toISOString(),
      active: true
    }
    setUsers(prev => [...prev, newUser])
    return newUser
  }

  const updateUser = (id, updates) => {
    setUsers(prev => prev.map(user => {
      if (user.id === id) {
        const updated = { ...user, ...updates }
        // Si se actualiza la contraseña, hashearla
        if (updates.password) {
          updated.passwordHash = simpleHash(updates.password.trim())
          delete updated.password
        }
        return updated
      }
      return user
    }))
  }

  const deleteUser = (id) => {
    setUsers(prev => prev.filter(user => user.id !== id))
  }

  const toggleUserStatus = (id) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, active: !user.active } : user
    ))
  }

  const getUserByUsername = (username) => {
    return users.find(user => user.username === username.trim())
  }

  const verifyPassword = (username, password) => {
    const user = getUserByUsername(username)
    if (!user || !user.active) return null
    const passwordHash = simpleHash(password.trim())
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

