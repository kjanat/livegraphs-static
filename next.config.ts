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
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // Provide empty modules for Node.js built-ins
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
        url: false,
        child_process: false,
        worker_threads: false
      };

      // Override process to prevent sql.js from thinking it's in Node.js
      config.plugins.push(
        new webpack.ProvidePlugin({
          process: ["process/browser"]
        })
      );

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
