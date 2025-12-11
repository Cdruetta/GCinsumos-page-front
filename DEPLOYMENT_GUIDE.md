# 🚀 Guía de Despliegue - Railway + Render

## Arquitectura de Despliegue

```
Railway (Backend + DB)
├── PostgreSQL Database
└── Node.js API (Express)
    ↓
Render (Frontend)
└── Next.js App
```

---

## PARTE 1: Desplegar Base de Datos en Railway

### Paso 1: Crear Proyecto en Railway

1. Ve a https://railway.app/ y crea una cuenta
2. Click en **"New Project"**
3. Selecciona **"Provision PostgreSQL"**
4. Railway creará automáticamente una base de datos PostgreSQL

### Paso 2: Obtener Credenciales

1. Click en tu servicio PostgreSQL
2. Ve a la pestaña **"Variables"**
3. Copia el valor de `DATABASE_URL` (algo como: `postgresql://postgres:...@...railway.app:5432/railway`)

---

## PARTE 2: Desplegar Backend en Railway

### Paso 1: Preparar el Backend para Producción

Ya está todo configurado, solo necesitas:

1. **Crear repositorio Git** (si no lo tienes):
   ```powershell
   cd "C:\Users\siste\OneDrive\Escritorio\Nueva carpeta\back"
   git init
   git add .
   git commit -m "Initial backend commit"
   ```

2. **Subir a GitHub**:
   - Crea un repositorio en GitHub llamado `gcinsumos-backend`
   - Sigue las instrucciones para subir tu código

### Paso 2: Desplegar en Railway

1. En Railway, click **"New Project"** → **"Deploy from GitHub repo"**
2. Selecciona tu repositorio `gcinsumos-backend`
3. Railway detectará automáticamente que es Node.js

### Paso 3: Configurar Variables de Entorno

En Railway, ve a tu servicio backend → **Variables** y agrega:

```env
DATABASE_URL=postgresql://postgres:...@...railway.app:5432/railway
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://tu-app.onrender.com
```

### Paso 4: Configurar Build y Start

Railway debería detectar automáticamente los scripts de `package.json`, pero verifica:

- **Build Command**: `npm install && npx prisma generate && npx prisma db push`
- **Start Command**: `npm start`

### Paso 5: Poblar Base de Datos

Una vez desplegado, ejecuta el seed desde Railway CLI o agrega un script:

```powershell
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link al proyecto
railway link

# Ejecutar seed
railway run npm run db:seed
```

---

## PARTE 3: Desplegar Frontend en Render

### Paso 1: Preparar Frontend

1. **Actualizar la URL del API** en el frontend para apuntar a Railway:

   Crea un archivo `.env.local` en la carpeta `front`:
   ```env
   NEXT_PUBLIC_API_URL=https://tu-backend.up.railway.app
   ```

2. **Crear repositorio Git**:
   ```powershell
   cd "C:\Users\siste\OneDrive\Escritorio\Nueva carpeta\front"
   git init
   git add .
   git commit -m "Initial frontend commit"
   ```

3. **Subir a GitHub**:
   - Crea un repositorio llamado `gcinsumos-frontend`
   - Sube tu código

### Paso 2: Desplegar en Render

1. Ve a https://render.com/ y crea una cuenta
2. Click **"New +"** → **"Web Service"**
3. Conecta tu repositorio `gcinsumos-frontend`
4. Configura:
   - **Name**: `gcinsumos`
   - **Environment**: `Node`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
   - **Instance Type**: `Free`

### Paso 3: Variables de Entorno en Render

Agrega en Render:
```env
NEXT_PUBLIC_API_URL=https://tu-backend.up.railway.app
```

---

## PARTE 4: Conectar Frontend con Backend

### Actualizar CORS en Backend

El backend ya tiene CORS configurado, pero asegúrate de actualizar la variable en Railway:

```env
FRONTEND_URL=https://gcinsumos.onrender.com
```

### Crear Cliente API en Frontend

Necesitarás crear un archivo para las llamadas API. ¿Quieres que te ayude a crear el cliente API para el frontend?

---

## Verificación Final

### 1. Verificar Backend
```
GET https://tu-backend.up.railway.app/health
GET https://tu-backend.up.railway.app/api/products
```

### 2. Verificar Frontend
```
https://gcinsumos.onrender.com
```

### 3. Verificar Integración
- El frontend debería cargar productos desde el backend
- El admin panel debería poder crear/editar productos
- El checkout debería crear órdenes

---

## Costos Estimados

- **Railway**: 
  - $5/mes de crédito gratis
  - PostgreSQL: ~$5-10/mes después del crédito
  - Backend: ~$5/mes

- **Render**:
  - Frontend: **GRATIS** (plan free)
  - Se duerme después de 15 min de inactividad

**Total**: ~$0-15/mes dependiendo del uso

---

## Próximos Pasos

1. ✅ Crear cuentas en Railway y Render
2. ✅ Desplegar PostgreSQL en Railway
3. ✅ Desplegar backend en Railway
4. ✅ Poblar base de datos con seed
5. ✅ Desplegar frontend en Render
6. ✅ Verificar que todo funcione

¿Quieres que te ayude con algún paso específico?
