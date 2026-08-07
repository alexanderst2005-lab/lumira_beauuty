import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'prod-files-secure.s3.us-west-2.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'iili.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'freeimage.host',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
