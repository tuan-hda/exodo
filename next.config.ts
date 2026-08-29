import type { NextConfig } from 'next'
import { getClerkAllowedRedirectOrigins, getNextAllowedDevOrigins } from './src/lib/clerk-origins'

const allowedDevOrigins = getNextAllowedDevOrigins(getClerkAllowedRedirectOrigins())

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(allowedDevOrigins.length ? { allowedDevOrigins } : {}),
}

export default nextConfig
