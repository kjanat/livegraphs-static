import type { NextConfig } from "next";

export const nodeConfig: Partial<NextConfig> = {
  output: "standalone",
  images: { unoptimized: false }, // turn on Next image optimizer (Sharp) in Node
  allowedDevOrigins: ["local-origin.dev", "*.local-origin.dev", "propc", "192.168.1.2"]
};
