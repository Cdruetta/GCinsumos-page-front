# 📸 Cómo Obtener la URL Directa de una Imagen

## ⚠️ Problema Común

Estás intentando usar una URL de una **página web** como URL de imagen:
```
❌ https://goetech.ar/productos/cargador-30w-modx-c015-intensify-usb-a-y-tipo-c-cable-usb-a-tipo-c-xaea/?srsltid=...
```

Esta es una URL de una **página HTML**, no una imagen. Necesitas la URL **directa de la imagen**.

## ✅ Solución: Obtener la URL Real de la Imagen

### Método 1: Desde el Navegador (Más Fácil)

1. **Abre la página del producto** en tu navegador
2. **Haz clic derecho** sobre la imagen del producto
3. Selecciona **"Copiar dirección de imagen"** o **"Copy image address"**
4. Obtendrás algo como:
   ```
   ✅ https://goetech.ar/wp-content/uploads/2024/01/cargador-30w.jpg
   ```

### Método 2: Inspeccionar Elemento

1. **Abre la página** en tu navegador
2. **Haz clic derecho** sobre la imagen
3. Selecciona **"Inspeccionar"** o **"Inspect"**
4. Busca el elemento `<img>` en el código
5. Copia el valor del atributo `src`:
   ```html
   <img src="https://goetech.ar/wp-content/uploads/2024/01/cargador-30w.jpg" />
   ```

### Método 3: Desde la Galería de Imágenes

Si la página tiene una galería:
1. Abre la galería de imágenes
2. Haz clic derecho en la imagen que quieres
3. Selecciona **"Abrir imagen en nueva pestaña"**
4. Copia la URL de la nueva pestaña (será la URL directa de la imagen)

## 📋 Formatos de URL Válidos para Imágenes

Las URLs de imágenes suelen terminar en:
- `.jpg` o `.jpeg`
- `.png`
- `.gif`
- `.webp`
- `.svg`
- `.bmp`

O contienen palabras como:
- `/image/`
- `/img/`
- `/uploads/`
- `/media/`

## ❌ URLs que NO Funcionan

```
❌ https://goetech.ar/productos/cargador-30w/  (página web)
❌ https://goetech.ar/productos/cargador-30w/?srsltid=...  (página con parámetros)
❌ https://goetech.ar/productos/cargador-30w/#gallery  (página con ancla)
```

## ✅ URLs que SÍ Funcionan

```
✅ https://goetech.ar/wp-content/uploads/2024/01/cargador-30w.jpg
✅ https://goetech.ar/images/productos/cargador-30w.png
✅ https://cdn.goetech.ar/cargador-30w.webp
✅ https://i.imgur.com/abc123.jpg
```

## 🔧 Ejemplo para tu Caso

Para el producto de Goetech:

1. Ve a: https://goetech.ar/productos/cargador-30w-modx-c015-intensify-usb-a-y-tipo-c-cable-usb-a-tipo-c-xaea/
2. Haz clic derecho en la imagen del producto
3. Copia la URL de la imagen (debería ser algo como):
   ```
   https://goetech.ar/wp-content/uploads/2024/XX/cargador-30w-modx-c015.jpg
   ```
4. Usa esa URL en el campo de imagen del producto

## 💡 Consejo

Si no puedes obtener la URL directa, puedes:
1. **Descargar la imagen** a tu computadora
2. **Subirla a un servicio de imágenes** como:
   - Imgur (https://imgur.com)
   - Cloudinary (https://cloudinary.com)
   - O tu propio servidor
3. **Usar la URL** que te proporciona el servicio

## 🚀 Para tu Backend

Si quieres que el backend descargue automáticamente la imagen desde una URL de página web, necesitarías:
1. Hacer scraping de la página para encontrar la imagen
2. Descargar la imagen
3. Guardarla en tu servidor

Pero es más fácil usar la URL directa de la imagen directamente.

