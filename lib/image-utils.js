export function buildImageUrl(imagePath) {
  if (!imagePath) return '/placeholder.svg'

  // URL completa
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  // Ruta relativa con slash inicial -> asumir backend
  if (imagePath.startsWith('/')) {
    return `${apiUrl}${imagePath}`
  }

  // Ruta relativa sin slash -> backend con slash
  return `${apiUrl}/${imagePath}`
}

