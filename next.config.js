/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Ensure middleware runs
  experimental: {
    middlewarePrefetch: 'flexible',
  },
  // Redirects (additional to middleware)
  async redirects() {
    return [
      {
        source: '/elevenlabs',
        destination: '/',
        permanent: true,
      },
      {
        source: '/elevenlabs/:path*',
        destination: '/?ref=elevenlabs-:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;