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
    // Add more robust sql.js handling
    config.externals = config.externals || [];
    config.externals.push({
      'sql.js': 'sql.js'
    });

    // Configure module resolution
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias
      },
      fallback: {
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
        zlib: false,
        http2: false,
        net: false,
        tls: false,
        child_process: false,
        worker_threads: false,
        process: false
      }
    };

    if (!isServer) {
      // Add ignore plugin to completely prevent bundling of Node.js modules
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^(fs|path|crypto|os|util|stream|buffer)$/
        })
      );
      // Ignore sql.js on server-side completely, use browser bundle for client
      config.resolve.alias = {
        ...config.resolve.alias,
        'sql.js$': 'sql.js/dist/sql-wasm.js'
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
