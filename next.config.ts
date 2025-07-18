import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",

  // Base path for GitHub Pages deployment
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || "",

  // Disable image optimization for static export
  images: {
    unoptimized: true
  },

  // Enable strict mode
  reactStrictMode: true,

  // Copy schema.sql to public directory during build,
  // enable WebAssembly support and force sql.js to its browser bundle
  webpack: (config, { isServer }) => {
    // Always apply sql.js alias to use browser-compatible bundle
    config.resolve.alias = {
      ...config.resolve.alias,
      "sql.js": "sql.js/dist/sql-wasm.js"
    };

    if (!isServer) {
      // polyfill/remove Node built-ins for client-side bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        assert: false,
        http: false,
        https: false,
        os: false,
        url: false
      };

      // enable async WebAssembly in Webpack
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true
      };

      // tell Webpack how to handle .wasm files
      config.module.rules.push({
        test: /\.wasm$/,
        type: "webassembly/async"
      });
    }

    return config;
  }
};

export default nextConfig;
