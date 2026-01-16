/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['better-sqlite3', 'drizzle-orm'],
  experimental: {
    testProxy: true
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'ngrok-skip-browser-warning',
            value: 'true'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
