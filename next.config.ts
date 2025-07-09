import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.travelapi.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
