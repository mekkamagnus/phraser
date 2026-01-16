/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  experimental: {
    testProxy: true
  }
}

module.exports = nextConfig
