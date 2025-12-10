export const products = [
  {
    id: 1,
    name: 'Monitor LED 27"',
    category: "Monitores",
    price: 29999,
    image: "/monitor-led-27-pulgadas.jpg",
    description: "Monitor 4K ultra clear para gaming y diseño",
    stock: 15,
  },
  {
    id: 2,
    name: "Teclado Mecánico RGB",
    category: "Periféricos",
    price: 8999,
    image: "/teclado-mecanico-rgb.jpg",
    description: "Teclado mecánico con switches Cherry MX",
    stock: 32,
  },
  {
    id: 3,
    name: "Mouse Gaming Pro",
    category: "Periféricos",
    price: 4999,
    image: "/mouse-gaming-profesional.jpg",
    description: "Mouse óptico 16000 DPI para gaming competitivo",
    stock: 48,
  },
  {
    id: 4,
    name: 'Laptop Gaming 15"',
    category: "Laptops",
    price: 89999,
    image: "/laptop-gaming-15-pulgadas.jpg",
    description: "RTX 4070, i7, 16GB RAM, SSD 512GB",
    stock: 8,
  },
  {
    id: 5,
    name: "Webcam 1080p HD",
    category: "Accesorios",
    price: 3499,
    image: "/webcam-1080p-hd.jpg",
    description: "Webcam con micrófono incorporado para streaming",
    stock: 25,
  },
  {
    id: 6,
    name: "SSD NVMe 1TB",
    category: "Almacenamiento",
    price: 12999,
    image: "/ssd-nvme-1tb.jpg",
    description: "SSD NVMe Gen 4 de alta velocidad",
    stock: 20,
  },
  {
    id: 7,
    name: "RAM DDR5 32GB",
    category: "Memoria",
    price: 18999,
    image: "/ram-ddr5-32gb.jpg",
    description: "Memoria RAM DDR5 para máximo rendimiento",
    stock: 12,
  },
  {
    id: 8,
    name: "Fuente ATX 850W",
    category: "Componentes",
    price: 9999,
    image: "/fuente-poder-atx-850w.jpg",
    description: "Fuente de poder 850W certificada 80+ Gold",
    stock: 18,
  },
  {
    id: 9,
    name: "Auriculares Bluetooth",
    category: "Audio",
    price: 5999,
    image: "/auriculares-bluetooth-premium.jpg",
    description: "Auriculares inalámbricos con cancellación de ruido",
    stock: 35,
  },
  {
    id: 10,
    name: "Hub USB-C 7 en 1",
    category: "Accesorios",
    price: 2499,
    image: "/hub-usb-c-7-puertos.jpg",
    description: "Hub multifunción con 7 puertos USB-C",
    stock: 40,
  },
]

export const categories = [
  "Todos",
  "Monitores",
  "Periféricos",
  "Laptops",
  "Accesorios",
  "Almacenamiento",
  "Memoria",
  "Componentes",
  "Audio",
]

export const getProductsByCategory = (category) => {
  if (category === "Todos") return products
  return products.filter((p) => p.category === category)
}

export const searchProducts = (query) => {
  const q = query.toLowerCase()
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q),
  )
}
