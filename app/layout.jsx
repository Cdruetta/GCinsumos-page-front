'use client'

import { PrimeReactProvider } from 'primereact/api'
import { CartProvider } from '@/lib/cart-context'
import 'primereact/resources/themes/lara-light-blue/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <title>GCinsumos - Artículos Tecnológicos</title>
        <meta name="description" content="Consulta y venta de artículos tecnológicos de calidad" />
      </head>
      <body>
        <PrimeReactProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </PrimeReactProvider>
      </body>
    </html>
  )
}
