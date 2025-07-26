import type { NextConfig } from "next";

export const staticConfig: Partial<NextConfig> = {
  output: "export",
  images: { unoptimized: true }
  // headers/rewrites don’t run in static exports; do them at the CDN if needed.
};
