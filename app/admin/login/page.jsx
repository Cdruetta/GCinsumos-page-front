'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from 'primereact/card'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Password } from 'primereact/password'
import { Toast } from 'primereact/toast'
import { useAuth } from '@/lib/auth-context'
import Image from 'next/image'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)
  const [showCredentials, setShowCredentials] = useState(false)
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()
  const toast = useRef(null)

  // Credenciales por defecto
  const defaultUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME || "neondb_owner"
  const defaultPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "npg_WKSC8uHL5xeB"

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/admin')
    }
  }, [isAuthenticated, router])

  // Desbloquear después de 5 minutos
  useEffect(() => {
    if (locked) {
      const timer = setTimeout(() => {
        setLocked(false)
        setAttempts(0)
        toast.current?.show({
          severity: 'info',
          summary: 'Desbloqueado',
          detail: 'Puedes intentar iniciar sesión nuevamente',
          life: 3000
        })
      }, 5 * 60 * 1000) // 5 minutos

      return () => clearTimeout(timer)
    }
  }, [locked])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (locked) {
      toast.current.show({
        severity: 'warn',
        summary: 'Cuenta bloqueada',
        detail: 'Demasiados intentos fallidos. Intenta nuevamente en unos minutos.',
        life: 5000
      })
      return
    }

    // Validación básica
    if (!username.trim() || !password.trim()) {
      toast.current.show({
        severity: 'warn',
        summary: 'Campos requeridos',
        detail: 'Por favor completa todos los campos',
        life: 3000
      })
      return
    }

    setLoading(true)

    // Simular delay para prevenir ataques de fuerza bruta
    await new Promise(resolve => setTimeout(resolve, 500))

    try {
      const success = await login(username.trim(), password)
      
      if (success) {
        setAttempts(0)
        toast.current.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Inicio de sesión exitoso',
          life: 2000
        })
        
        setTimeout(() => {
          router.push('/admin')
        }, 500)
      } else {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        
        if (newAttempts >= 5) {
          setLocked(true)
          toast.current.show({
            severity: 'error',
            summary: 'Cuenta bloqueada',
            detail: 'Demasiados intentos fallidos. Intenta nuevamente en 5 minutos.',
            life: 5000
          })
        } else {
          toast.current.show({
            severity: 'error',
            summary: 'Error',
            detail: `Usuario o contraseña incorrectos. Intentos restantes: ${5 - newAttempts}`,
            life: 3000
          })
        }
        setPassword('')
      }
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al iniciar sesión. Por favor intenta nuevamente.',
        life: 3000
      })
      setPassword('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #f8fafc 100%)',
      padding: '1rem'
    }}>
      <Toast ref={toast} />
      
      <Card style={{
        width: '100%',
        maxWidth: '420px',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #ff7a00, #ff9f4d)',
            padding: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(255, 122, 0, 0.3)',
            marginBottom: '1rem'
          }}>
            <Image 
              src="/gclogo.png" 
              alt="GCinsumos" 
              width={56} 
              height={56}
              style={{ objectFit: 'contain' }}
            />
          </div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #ff7a00, #ff9f4d)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            Panel de Administración
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {/* Panel de credenciales por defecto */}
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 122, 0, 0.2)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            cursor: 'pointer'
          }}
          onClick={() => setShowCredentials(!showCredentials)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="pi pi-info-circle" style={{ color: '#ff7a00', fontSize: '1rem' }}></i>
              <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>
                Credenciales por defecto
              </span>
            </div>
            <i className={`pi ${showCredentials ? 'pi-chevron-up' : 'pi-chevron-down'}`} style={{ color: '#ff7a00' }}></i>
          </div>
          {showCredentials && (
            <div style={{
              paddingTop: '0.75rem',
              borderTop: '1px solid rgba(255, 122, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500' }}>Usuario:</span>
                <code style={{
                  background: '#fff',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#ff7a00',
                  border: '1px solid rgba(255, 122, 0, 0.2)'
                }}>
                  {defaultUsername}
                </code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500' }}>Contraseña:</span>
                <code style={{
                  background: '#fff',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#ff7a00',
                  border: '1px solid rgba(255, 122, 0, 0.2)'
                }}>
                  {defaultPassword}
                </code>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUsername(defaultUsername)
                  setPassword(defaultPassword)
                  setShowCredentials(false)
                }}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  background: 'linear-gradient(135deg, #ff7a00, #ff9f4d)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 122, 0, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <i className="pi pi-copy" style={{ marginRight: '0.5rem' }}></i>
                Usar estas credenciales
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="username" style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#1e293b',
              fontSize: '0.9rem'
            }}>
              Usuario
            </label>
            <InputText
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
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
              autoComplete="username"
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label htmlFor="password" style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#1e293b',
              fontSize: '0.9rem'
            }}>
              Contraseña
            </label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              feedback={false}
              toggleMask
              style={{
                width: '100%'
              }}
              inputStyle={{
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
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            label={loading ? 'Iniciando sesión...' : locked ? 'Cuenta bloqueada' : 'Iniciar Sesión'}
            icon={loading ? 'pi pi-spin pi-spinner' : locked ? 'pi pi-lock' : 'pi pi-sign-in'}
            style={{
              width: '100%',
              background: locked 
                ? '#cbd5e1' 
                : 'linear-gradient(135deg, #ff7a00, #ff9f4d)',
              border: 'none',
              fontWeight: 600,
              padding: '0.875rem 1.75rem',
              borderRadius: '12px',
              boxShadow: locked 
                ? 'none' 
                : '0 4px 12px rgba(255, 122, 0, 0.3)',
              transition: 'all 0.3s ease',
              fontSize: '1rem',
              minHeight: '48px'
            }}
            disabled={loading || locked}
            onMouseEnter={(e) => {
              if (!loading && !locked) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 122, 0, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = locked ? 'none' : '0 4px 12px rgba(255, 122, 0, 0.3)'
            }}
          />
        </form>

        <div style={{
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          alignItems: 'center'
        }}>
          <button
            type="button"
            onClick={() => router.push('/')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ff7a00'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#64748b'
            }}
          >
            <i className="pi pi-arrow-left"></i>
            Volver al inicio
          </button>
          <p style={{
            fontSize: '0.75rem',
            color: '#94a3b8',
            textAlign: 'center',
            margin: 0
          }}>
            ¿Olvidaste tus credenciales? Contacta al administrador del sistema.
          </p>
        </div>
      </Card>
    </div>
  )
}

