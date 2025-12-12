'use client'

import { PrimeReactProvider } from 'primereact/api'
import { CartProvider } from '@/lib/cart-context'
import { UsersProvider } from '@/lib/users-context'
import { AuthProvider } from '@/lib/auth-context'
import Footer from '@/components/Footer'
import 'primereact/resources/themes/lara-light-blue/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <title>GCinsumos</title>
        <meta name="description" content="Venta de artículos tecnológicos de calidad y soluciones tech" />
      </head>
      <body>
        <PrimeReactProvider>
          <UsersProvider>
            <AuthProvider>
              <CartProvider>
                <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                  <main style={{ flex: 1 }}>
                    {children}
                  </main>
                  <Footer />
                </div>
              </CartProvider>
            </AuthProvider>
          </UsersProvider>
        </PrimeReactProvider>
      </body>
    </html>
  )
}
