'use client'

import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
import { Tag } from 'primereact/tag'
import { useCart } from '@/lib/cart-context'

export default function ProductCard({ product }) {
    const { addToCart } = useCart()

    const header = (
        <img
            alt={product.name}
            src={product.image || '/placeholder.svg'}
            style={{ width: '100%', height: '200px', objectFit: 'cover' }}
        />
    )

    const footer = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2196F3' }}>
                ${product.price.toLocaleString('es-AR')}
            </span>
            <Button
                label="Agregar"
                icon="pi pi-shopping-cart"
                onClick={() => addToCart(product)}
                disabled={product.stock === 0}
            />
        </div>
    )

    return (
        <Card
            title={product.name}
            subTitle={product.category}
            header={header}
            footer={footer}
            style={{ marginBottom: '1rem' }}
        >
            <p style={{ marginBottom: '0.5rem' }}>{product.description}</p>
            <Tag
                value={product.stock > 0 ? `Stock: ${product.stock}` : 'Sin stock'}
                severity={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'danger'}
            />
        </Card>
    )
}
