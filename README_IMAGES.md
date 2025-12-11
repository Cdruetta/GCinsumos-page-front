# 📸 Guía de Manejo de Imágenes - GCinsumos

## ¿Dónde cargar las imágenes de productos?

Tienes **3 opciones principales**. Te explico cada una:

---

## 🎯 Opción 1: Backend (RECOMENDADO) ✅

### Cómo funciona:
- Las imágenes se almacenan físicamente en el **backend** (carpeta `uploads/` o `public/images/`)
- La **base de datos** solo guarda la **ruta/URL** de la imagen (ej: `/images/productos/monitor.jpg`)
- El backend sirve las imágenes como archivos estáticos
- El frontend las carga desde el backend

### Estructura recomendada en el backend:
```
backend/
├── uploads/
│   └── productos/
│       ├── monitor-led-27.jpg
│       ├── teclado-mecanico.jpg
│       └── ...
├── server.js (configurar para servir archivos estáticos)
└── ...
```

### Configuración en el backend (Express):
```javascript
// En tu server.js o app.js
const express = require('express')
const path = require('path')

// Servir archivos estáticos desde la carpeta uploads
app.use('/images', express.static(path.join(__dirname, 'uploads')))
```

### En la base de datos:
```sql
-- Campo image en la tabla products
image VARCHAR(255) -- Ejemplo: "/images/productos/monitor-led-27.jpg"
```

### Ventajas:
- ✅ Control total sobre las imágenes
- ✅ Fácil de implementar
- ✅ No requiere servicios externos
- ✅ Las imágenes se actualizan con el backend

### Desventajas:
- ⚠️ Consume espacio del servidor del backend
- ⚠️ Puede ser más lento si hay muchas imágenes

---

## 🎯 Opción 2: Frontend (Solo para imágenes estáticas)

### Cómo funciona:
- Las imágenes se colocan en la carpeta `public/` del frontend
- Solo funciona para imágenes que **no cambian** (logos, iconos, etc.)
- **NO recomendado** para imágenes de productos que cambian dinámicamente

### Estructura:
```
front/
└── public/
    ├── gclogo.png
    ├── monitor-led-27.jpg
    └── ...
```

### En la base de datos:
```sql
-- Campo image en la tabla products
image VARCHAR(255) -- Ejemplo: "/monitor-led-27.jpg"
```

### Ventajas:
- ✅ Muy rápido (servido directamente por Next.js)
- ✅ No carga el backend

### Desventajas:
- ❌ Las imágenes deben estar en el código del frontend
- ❌ Cada cambio requiere redeploy del frontend
- ❌ No escalable para muchos productos

---

## 🎯 Opción 3: Servicio Externo (Cloudinary, AWS S3, etc.) - MEJOR PARA PRODUCCIÓN

### Cómo funciona:
- Las imágenes se suben a un servicio de almacenamiento en la nube
- La base de datos guarda la **URL completa** de la imagen
- El frontend carga las imágenes directamente desde el servicio

### Ejemplo con Cloudinary:
```javascript
// En el backend al crear/actualizar producto
const cloudinary = require('cloudinary').v2

// Subir imagen
const result = await cloudinary.uploader.upload(imageFile, {
  folder: 'gcinsumos/productos'
})

// Guardar URL en la base de datos
product.image = result.secure_url // https://res.cloudinary.com/...
```

### En la base de datos:
```sql
-- Campo image en la tabla products
image VARCHAR(500) -- Ejemplo: "https://res.cloudinary.com/.../monitor.jpg"
```

### Ventajas:
- ✅ Escalable (miles de imágenes)
- ✅ Optimización automática (redimensionamiento, compresión)
- ✅ CDN incluido (carga rápida en todo el mundo)
- ✅ No consume recursos del backend

### Desventajas:
- ⚠️ Requiere configuración adicional
- ⚠️ Puede tener costos (aunque muchos tienen plan gratuito)

---

## 🔧 Configuración Actual del Frontend

El frontend ya está configurado para funcionar con **cualquiera de las 3 opciones**:

### Función `getImageUrl()` implementada:
- ✅ Si la imagen es una URL completa (`https://...`), la usa directamente
- ✅ Si es una ruta relativa (`/images/...`), la carga desde el backend
- ✅ Si no hay imagen, muestra un placeholder

### Ejemplos de valores en la base de datos:

```javascript
// Opción 1: Backend (ruta relativa)
image: "/images/productos/monitor.jpg"
// Se convierte en: https://gcinsumos-back.onrender.com/images/productos/monitor.jpg

// Opción 2: Frontend (ruta relativa)
image: "/monitor.jpg"
// Se convierte en: https://gcinsumos-page-front.onrender.com/monitor.jpg

// Opción 3: Servicio externo (URL completa)
image: "https://res.cloudinary.com/.../monitor.jpg"
// Se usa directamente: https://res.cloudinary.com/.../monitor.jpg
```

---

## 📋 Recomendación para tu caso

### Para empezar rápido:
**Usa la Opción 1 (Backend)**:
1. Crea una carpeta `uploads/productos/` en tu backend
2. Configura Express para servir archivos estáticos
3. Al crear productos, guarda las imágenes ahí
4. En la base de datos, guarda la ruta: `/images/productos/nombre-imagen.jpg`

### Para producción escalable:
**Usa la Opción 3 (Cloudinary)**:
1. Crea cuenta en Cloudinary (gratis hasta cierto límite)
2. Configura el backend para subir imágenes a Cloudinary
3. Guarda la URL completa en la base de datos

---

## 🚀 Pasos para implementar (Backend)

### 1. Crear carpeta de imágenes:
```bash
mkdir uploads
mkdir uploads/productos
```

### 2. Configurar Express para servir archivos estáticos:
```javascript
// En server.js o app.js
app.use('/images', express.static('uploads'))
```

### 3. Endpoint para subir imágenes (opcional):
```javascript
const multer = require('multer')
const upload = multer({ dest: 'uploads/productos/' })

app.post('/api/upload', upload.single('image'), (req, res) => {
  res.json({ 
    imageUrl: `/images/productos/${req.file.filename}` 
  })
})
```

### 4. En la base de datos, guardar solo la ruta:
```javascript
// Al crear producto
product.image = `/images/productos/${filename}`
```

---

## ✅ El frontend ya está listo

El código del frontend ya maneja automáticamente:
- ✅ URLs completas (https://...)
- ✅ Rutas relativas del backend (/images/...)
- ✅ Rutas relativas del frontend (/...)
- ✅ Placeholder si no hay imagen

**Solo necesitas configurar el backend para servir las imágenes.**

