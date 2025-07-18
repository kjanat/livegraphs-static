import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  experimental: {
    // Disable static optimization to avoid server-side execution
    optimizeServerReact: false
  },

  // Base path for GitHub Pages deployment
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || "",

  // Disable image optimization for static export
  images: {
    unoptimized: true
  },

  // Enable strict mode
  reactStrictMode: true,

  // Enable WebAssembly support and configure for browser usage
  webpack: (config, { isServer, webpack }) => {
    // Configure externals for server-side builds to avoid bundling certain modules
    if (isServer) {
      // Ensure externals is properly configured
      if (Array.isArray(config.externals)) {
        config.externals.push({
          fs: "fs",
          os: "os",
          crypto: "crypto",
          stream: "stream",
          buffer: "buffer",
          util: "util"
        });
      } else if (typeof config.externals === "object") {
        config.externals = {
          ...config.externals,
          fs: "fs",
          os: "os",
          crypto: "crypto",
          stream: "stream",
          buffer: "buffer",
          util: "util"
        };
      }
    }

    // Configure browser fallbacks for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: require.resolve("path-browserify"),
      crypto: false,
      stream: false,
      buffer: false,
      util: false,
      assert: false,
      http: false,
      https: false,
      os: false,
      url: false,
      zlib: false,
      http2: false,
      net: false,
      tls: false,
      child_process: false,
      worker_threads: false,
      process: false,
      module: false
    };

    // Add ignore plugin to prevent bundling of Node.js modules
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(fs|path|crypto|os|util|stream|buffer)$/
      })
    );

    // For server builds, also ignore path module specifically
    if (isServer) {
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^path$/
        })
      );
    }

    // Only configure WebAssembly for client-side builds
    if (!isServer) {
      // Enable async WebAssembly in Webpack
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true
      };

      // Configure WASM file handling
      config.module.rules.push({
        test: /\.wasm$/,
        type: "webassembly/async"
      });
    }

    return config;
  }
};

export default nextConfig;
