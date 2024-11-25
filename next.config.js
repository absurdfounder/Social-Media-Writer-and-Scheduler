/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
      domains: [
          'lh3.googleusercontent.com',  // For Google profile images
          'localhost',
          'firebasestorage.googleapis.com' // For Firebase Storage images if needed
      ],
  },
  async rewrites() {
      return [
          {
              source: '/api/:path*',
              destination: '/api/:path*',
          },
      ];
  },
};

module.exports = nextConfig;