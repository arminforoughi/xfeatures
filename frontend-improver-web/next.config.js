/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['survivalofthefeature.com'],
    unoptimized: true,
  },
  experimental: {
    serverActions: true,
  }
}

module.exports = nextConfig 