import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  // Other Next.js config options can go here
};

export default nextConfig;
