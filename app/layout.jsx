import "./globals.css"
import { CartProvider } from "@/lib/cart-context"

export const metadata = {
  title: "GCinsumos",
  description: "Consulta y venta de artículos tecnológicos de calidad",
  generator: 'v0.app'
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="font-sans antialiased bg-background text-foreground">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}
