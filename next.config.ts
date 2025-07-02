import type { NextConfig } from "next";
import withPWA from 'next-pwa';

const withPWAConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig = withPWAConfig({
  images: {
    domains: [
      'res.cloudinary.com',
      'localhost',
      'campus-stay.vercel.app',
      'campus-stay-git-main-louissosthenes9.vercel.app',
      'campus-stay-louissosthenes9.vercel.app',
      'campus-stay-*.vercel.app'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

});

export default nextConfig;