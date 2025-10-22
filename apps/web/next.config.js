/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    transpilePackages: ['@repo/db'],
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', '@prisma/engines'],
  },
   outputFileTracingIncludes: {
    '/api/**/*': ['../../packages/db/src/generated/prisma/**/*'],
  },

  // For standalone output
  output: 'standalone',
};
export default nextConfig;
