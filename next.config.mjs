/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Desactivar Turbopack explícitamente
  experimental: {
    turbo: false,
  },
}

export default nextConfig
