/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'
const isGHPages = process.env.GITHUB_PAGES === 'true'

const nextConfig = {
  reactStrictMode: true,
  output: isGHPages ? 'export' : undefined,
  basePath: isGHPages ? '/Coe' : '',
  assetPrefix: isGHPages ? '/Coe/' : '',
  images: { unoptimized: true },
  experimental: {
    esmExternals: 'loose',
  },
}

export default nextConfig
