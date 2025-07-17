import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Enable strict mode
  reactStrictMode: true,
  
  // Copy schema.sql to public directory during build
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;