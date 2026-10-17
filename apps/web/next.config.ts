import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@telegram-drive/types'],
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
    middlewareClientMaxBodySize: '3gb',
    proxyTimeout: 6 * 60 * 60 * 1000,
  },
}

export default nextConfig
