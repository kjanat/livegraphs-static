import type { NextConfig } from "next";

export const baseConfig: Partial<NextConfig> = {
  reactStrictMode: true,

  transpilePackages: [
    "recharts",
    "recharts-scale",
    "d3-scale",
    "d3-array",
    "d3-shape",
    "d3-time",
    "d3-format"
  ],

  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: "./tsconfig.json"
  },

  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          eventemitter3: require.resolve("eventemitter3")
        },
        fallback: {
          ...config.resolve?.fallback,
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
    }
    // No IgnorePlugin/NormalModuleReplacement/CopyPlugin here — we’ll use a prebuild step for SQL.js
    return config;
  }
};
