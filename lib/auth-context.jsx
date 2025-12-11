"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { UsersContext } from "./users-context"
import { verifyUser } from "./api"

const AUTH_STORAGE_KEY = "gcinsumos_admin_auth"
const AUTH_USER_KEY = "gcinsumos_admin_user"
const AUTH_TIMESTAMP_KEY = "gcinsumos_admin_timestamp"
const SESSION_TIMEOUT = 8 * 60 * 60 * 1000 // 8 horas en milisegundos
const AuthContext = createContext()

// Función simple para hash de contraseña (solo para comparación, no para almacenamiento seguro)
const simpleHash = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convertir a entero de 32 bits
  }
  return hash.toString()
}

// Obtener credenciales desde variables de entorno o usar defaults
const getCredentials = () => {
  // Credenciales por defecto (usar variables de entorno en producción)
  const username = process.env.NEXT_PUBLIC_ADMIN_USERNAME || "neondb_owner"
  const password = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "npg_WKSC8uHL5xeB"
  
  return {
    username: username.trim(),
    passwordHash: simpleHash(password.trim())
  }
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [mounted, setMounted] = useState(false)
  
  // Intentar obtener el contexto de usuarios (puede no estar disponible)
  let usersContext = null
  try {
    usersContext = useContext(UsersContext)
  } catch (e) {
    // UsersProvider no está disponible, usar solo credenciales legacy
  }

  const logout = () => {
    setIsAuthenticated(false)
    setCurrentUser(null)
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_STORAGE_KEY)
        localStorage.removeItem(AUTH_USER_KEY)
        localStorage.removeItem(AUTH_TIMESTAMP_KEY)
      }
    } catch (error) {
      console.error("No se pudo eliminar el estado de autenticación", error)
    }
  }

  // Verificar si la sesión ha expirado
  const checkSessionExpiry = () => {
    if (typeof window === 'undefined') return false
    try {
      const timestamp = localStorage.getItem(AUTH_TIMESTAMP_KEY)
      if (!timestamp) return false
      
      const sessionTime = parseInt(timestamp, 10)
      const now = Date.now()
      const elapsed = now - sessionTime
      
      if (elapsed > SESSION_TIMEOUT) {
        return false
      }
      return true
    } catch (error) {
      console.error("Error al verificar expiración de sesión", error)
      return false
    }
  }

  // Hidrata el estado de autenticación desde localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    setMounted(true)
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY)
      const userStored = localStorage.getItem(AUTH_USER_KEY)
      if (stored && userStored) {
        const parsed = JSON.parse(stored)
        const userData = JSON.parse(userStored)
        if (parsed === true && checkSessionExpiry()) {
          setIsAuthenticated(true)
          setCurrentUser(userData)
          // Actualizar timestamp para extender sesión
          localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString())
        } else {
          // Sesión expirada o inválida
          logout()
        }
      }
    } catch (error) {
      console.error("No se pudo leer el estado de autenticación", error)
      setIsAuthenticated(false)
    }
  }, [])

  // Verificar expiración periódicamente
  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined') return

    const interval = setInterval(() => {
      if (!checkSessionExpiry()) {
        logout()
      }
    }, 60 * 1000) // Verificar cada minuto

    return () => clearInterval(interval)
  }, [isAuthenticated])

  const login = async (username, password) => {
    try {
      // Primero intentar con la API
      try {
        const user = await verifyUser(username, password)
        if (user) {
          setIsAuthenticated(true)
          setCurrentUser(user)
          const timestamp = Date.now().toString()
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(true))
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
          localStorage.setItem(AUTH_TIMESTAMP_KEY, timestamp)
          return true
        }
      } catch (apiError) {
        console.log("Error al verificar con API, intentando con usuarios locales:", apiError)
      }

      // Fallback a verificación local (para compatibilidad)
      if (usersContext && usersContext.mounted) {
        const user = usersContext.verifyPassword(username, password)
        if (user) {
          setIsAuthenticated(true)
          setCurrentUser(user)
          const timestamp = Date.now().toString()
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(true))
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
          localStorage.setItem(AUTH_TIMESTAMP_KEY, timestamp)
          return true
        }
      }

      // Fallback a credenciales legacy (para compatibilidad)
      const credentials = getCredentials()
      const inputUsername = username.trim()
      const inputPasswordHash = simpleHash(password.trim())

      if (
        inputUsername === credentials.username &&
        inputPasswordHash === credentials.passwordHash
      ) {
        const legacyUser = {
          id: 'legacy',
          username: credentials.username,
          role: 'root',
          createdAt: new Date().toISOString()
        }
        setIsAuthenticated(true)
        setCurrentUser(legacyUser)
        const timestamp = Date.now().toString()
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(true))
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(legacyUser))
        localStorage.setItem(AUTH_TIMESTAMP_KEY, timestamp)
        return true
      }
      return false
    } catch (error) {
      console.error("Error en login", error)
      return false
    }
  }


  const hasPermission = (requiredRole) => {
    if (!currentUser) return false
    if (!usersContext || !usersContext.mounted) return true // Fallback para usuarios legacy
    return usersContext.hasPermission(currentUser.role, requiredRole)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        login,
        logout,
        hasPermission,
        mounted,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

