"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useCart } from "@/lib/cart-context"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { cartCount, mounted } = useCart()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Replaced GC text with logo image */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/gclogo.png" alt="GC Insumos" width={40} height={40} className="w-10 h-10 object-contain" />
            <span className="hidden sm:inline text-xl font-bold text-foreground">Insumos</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Catálogo
            </Link>
            <Link href="/admin" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Admin
            </Link>
          </nav>

          {/* Cart Icon */}
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative p-2 text-foreground hover:text-primary transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {mounted && cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-3">
            <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Catálogo
            </Link>
            <Link href="/admin" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Admin
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
