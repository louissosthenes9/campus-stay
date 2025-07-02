import type { NextConfig } from "next";
import { WithPWA } from 'next-pwa'

const nextConfig: NextConfig = withPWA({
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
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development'
  }
}  // Other Next.js config options can go here
);

export default nextConfig;
function withPWA(arg0: { images: { domains: string[]; remotePatterns: { protocol: string; hostname: string; port: string; pathname: string; }[]; }; pwa: { dest: string; register: boolean; skipWaiting: boolean; disable: boolean; }; }): NextConfig {
  throw new Error("Function not implemented.");
}

