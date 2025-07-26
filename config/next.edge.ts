import type { NextConfig } from "next";

export const edgeConfig: Partial<NextConfig> = {
  images: { unoptimized: true }
};
