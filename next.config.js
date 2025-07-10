/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Penting untuk Docker deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: ['localhost', 'kitversity.com']
  },
  // Optimasi untuk production
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // Environment variables yang akan tersedia di client
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  }
};

module.exports = nextConfig;
