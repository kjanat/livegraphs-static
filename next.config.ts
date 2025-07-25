import CopyPlugin from "copy-webpack-plugin";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",

  // Disable build-activity overlay and auto-prerender in dev mode
  // devIndicators: false,

  allowedDevOrigins: ["local-origin.dev", "*.local-origin.dev", "propc", "192.168.1.2"],

  // Transpile recharts to fix EventEmitter3 issues
  transpilePackages: [
    "recharts",
    "recharts-scale",
    "d3-scale",
    "d3-array",
    "d3-shape",
    "d3-time",
    "d3-format"
  ],

  // Disable image optimization for static export
  images: {
    unoptimized: true
  },

  // Enable strict mode
  reactStrictMode: true,

  // TypeScript configuration
  typescript: {
    // Ignore TypeScript errors in test files during build
    ignoreBuildErrors: false,
    tsconfigPath: "./tsconfig.json"
  },

  // Optimize imports for better tree shaking
  /* experimental: {
    optimizePackageImports: [
      "chart.js",
      "react-chartjs-2",
      "@nivo/core",
      "@nivo/geo",
      "date-fns",
      "@/components/ui"
    ]
  }, */

  // Note: Security headers need to be configured at the hosting level
  // for static exports (e.g., in nginx, Vercel, Netlify configs)
  // See: https://nextjs.org/docs/messages/export-no-custom-routes

  // Copy schema.sql to public directory during build,
  // enable WebAssembly support and force sql.js to its browser bundle
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // Configure module resolution for browser environment
      config.resolve = {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          // Fix for recharts EventEmitter3 issue
          eventemitter3: require.resolve("eventemitter3")
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

      // Add ignore plugin to completely prevent bundling of Node.js modules
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^(fs|path|crypto|os|util|stream|buffer)$/
        })
      );

      // Use NormalModuleReplacementPlugin to force sql.js to use browser build
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/sql\.js$/, (resource: { request: string }) => {
          resource.request = resource.request.replace(/sql\.js$/, "sql.js/dist/sql-wasm.js");
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

      // Copy SQL.js WASM files to public directory
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: "node_modules/sql.js/dist/sql-wasm.js",
              to: "../public/sql-js/sql-wasm.js"
            },
            {
              from: "node_modules/sql.js/dist/sql-wasm.wasm",
              to: "../public/sql-js/sql-wasm.wasm"
            }
          ]
        })
      );
    }

    return config;
  }
};

export default nextConfig;
