# 🔐 Sistema de Autenticación - GCinsumos

## Configuración de Credenciales

### Desarrollo Local

1. Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_ADMIN_USERNAME=tu_usuario
NEXT_PUBLIC_ADMIN_PASSWORD=tu_contraseña_segura
NEXT_PUBLIC_API_URL=http://localhost:5000
```

2. Reinicia el servidor de desarrollo:
```bash
npm run dev
```

### Producción (Render)

1. Ve a tu proyecto en Render Dashboard
2. Navega a **Environment Variables**
3. Agrega las siguientes variables:

```
NEXT_PUBLIC_ADMIN_USERNAME=tu_usuario_seguro
NEXT_PUBLIC_ADMIN_PASSWORD=tu_contraseña_muy_segura
NEXT_PUBLIC_API_URL=https://tu-backend.up.railway.app
```

4. Haz un nuevo deploy para aplicar los cambios

## Características de Seguridad

### ✅ Implementadas

- **Variables de entorno**: Las credenciales se configuran mediante variables de entorno
- **Hash de contraseñas**: Las contraseñas se comparan usando hash simple (no se almacenan en texto plano)
- **Timeout de sesión**: Las sesiones expiran después de 8 horas de inactividad
- **Protección contra fuerza bruta**: Bloqueo temporal después de 5 intentos fallidos
- **Validación de entrada**: Sanitización de inputs
- **Persistencia segura**: El estado de autenticación se almacena en localStorage con timestamp

### 🔒 Recomendaciones para Producción

1. **Cambiar credenciales por defecto**: 
   - Usa credenciales fuertes y únicas
   - No uses las credenciales de ejemplo en producción

2. **Variables de entorno**:
   - Nunca subas `.env.local` a Git
   - Usa variables de entorno en Render para producción

3. **Autenticación del backend**:
   - Considera implementar autenticación real en el backend
   - Usa JWT tokens o sesiones del servidor
   - Implementa rate limiting en el backend

4. **HTTPS**:
   - Asegúrate de usar HTTPS en producción
   - Render proporciona HTTPS automáticamente

5. **Monitoreo**:
   - Considera agregar logging de intentos de acceso
   - Monitorea intentos fallidos de login

## Uso

### Acceder al Panel de Admin

1. Navega a `/admin` o `/admin/login`
2. Ingresa tus credenciales
3. Serás redirigido automáticamente al panel de administración

### Cerrar Sesión

- Haz clic en el botón "Cerrar Sesión" en el panel de admin
- La sesión se cerrará y serás redirigido al login

## Credenciales por Defecto

⚠️ **IMPORTANTE**: Las credenciales por defecto configuradas son:

- Usuario: `neondb_owner`
- Contraseña: `npg_WKSC8uHL5xeB`

**Para producción, se recomienda cambiar estas credenciales usando variables de entorno en Render para mayor seguridad.**

## Solución de Problemas

### No puedo iniciar sesión

1. Verifica que las variables de entorno estén configuradas correctamente
2. Asegúrate de haber reiniciado el servidor después de cambiar las variables
3. Verifica que no hayas alcanzado el límite de intentos (5 intentos = bloqueo de 5 minutos)

### La sesión expira muy rápido

- Las sesiones duran 8 horas por defecto
- Puedes ajustar `SESSION_TIMEOUT` en `lib/auth-context.jsx` si es necesario

### Olvidé mis credenciales

- En desarrollo: revisa tu archivo `.env.local`
- En producción: revisa las variables de entorno en Render Dashboard

