/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    workerThreads: false,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@mongodb-js/zstd', 'kerberos', 'mongodb-client-encryption');
    }
    return config;
  },
  // Optimize for deployment
  // Increase timeout for API routes
  serverRuntimeConfig: {
    maxDuration: 300, // 5 minutes
  },
  // Configure for Render deployment
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    PORT: process.env.PORT,
  },
}

export default nextConfig
