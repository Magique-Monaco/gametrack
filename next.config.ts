import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.freetogame.com',
        port: '',
        pathname: '/g/**',
      },
      {
        protocol: 'https',
        hostname: 'images.igdb.com',
        port: '',
        pathname: '/igdb/image/upload/**',
      }
    ],
  },
};

export default nextConfig;
