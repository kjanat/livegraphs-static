import type { NextConfig } from "next";
import { resolveTarget } from "./config/env";
import { baseConfig } from "./config/next.base";
import { edgeConfig } from "./config/next.edge";
import { nodeConfig } from "./config/next.node";
import { staticConfig } from "./config/next.static";

type WebpackModule = {
  DefinePlugin: any;
  ProvidePlugin: any;
  [key: string]: any;
};

type WebpackConfigContext = {
  dev: boolean;
  isServer: boolean;
  buildId: string;
  config: NextConfig;
  defaultLoaders: { babel: unknown };
  webpack: WebpackModule;
  nextRuntime?: "nodejs" | "edge";
};

type WebpackConfig = object;
type WebpackConfigFunction = (
  config: WebpackConfig,
  context: WebpackConfigContext
) => WebpackConfig;

type ImageConfig = {
  remotePatterns?: Array<any>;
  deviceSizes?: number[];
  imageSizes?: number[];
  domains?: string[];
  formats?: Array<"image/avif" | "image/webp">;
  [key: string]: any;
};

type RewritesConfig =
  | Array<any>
  | {
      beforeFiles?: Array<any>;
      afterFiles?: Array<any>;
      fallback?: Array<any>;
    };

function merge(a: Partial<NextConfig>, b: Partial<NextConfig>): Partial<NextConfig> {
  const out: Partial<NextConfig> = { ...a, ...b };

  if (a.images || b.images) {
    const ai = (a.images as ImageConfig) ?? {};
    const bi = (b.images as ImageConfig) ?? {};
    const mergedImages = { ...ai, ...bi } as ImageConfig;

    if (ai.remotePatterns || bi.remotePatterns) {
      mergedImages.remotePatterns = [...(ai.remotePatterns ?? []), ...(bi.remotePatterns ?? [])];
    }
    if (ai.deviceSizes || bi.deviceSizes) {
      mergedImages.deviceSizes = [...(ai.deviceSizes ?? []), ...(bi.deviceSizes ?? [])];
    }
    if (ai.imageSizes || bi.imageSizes) {
      mergedImages.imageSizes = [...(ai.imageSizes ?? []), ...(bi.imageSizes ?? [])];
    }
    if (ai.domains || bi.domains) {
      mergedImages.domains = [...(ai.domains ?? []), ...(bi.domains ?? [])];
    }
    if (ai.formats || bi.formats) {
      mergedImages.formats = [...(ai.formats ?? []), ...(bi.formats ?? [])] as Array<
        "image/avif" | "image/webp"
      >;
    }
    out.images = mergedImages;
  }

  if (a.experimental || b.experimental) {
    out.experimental = {
      ...(a.experimental ?? {}),
      ...(b.experimental ?? {})
    };
  }

  if (a.compiler || b.compiler) {
    out.compiler = { ...(a.compiler ?? {}), ...(b.compiler ?? {}) };
  }

  const wa = a.webpack as WebpackConfigFunction | undefined;
  const wb = b.webpack as WebpackConfigFunction | undefined;
  if (wa && wb)
    out.webpack = (cfg: WebpackConfig, ctx: WebpackConfigContext) => wb(wa(cfg, ctx), ctx);
  else out.webpack = (wa || wb) as typeof a.webpack;

  type ConfigFunction<T> = () => Promise<T>;

  const combine = <T extends Array<any>>(
    fa?: ConfigFunction<T>,
    fb?: ConfigFunction<T>
  ): ConfigFunction<T> | undefined =>
    fa && fb
      ? async (): Promise<T> => {
          const [ra, rb] = await Promise.all([fa(), fb()]);
          return [...(rb ?? []), ...(ra ?? [])] as T;
        }
      : fa || fb;

  const combineRewrites = (
    fa?: ConfigFunction<RewritesConfig>,
    fb?: ConfigFunction<RewritesConfig>
  ): ConfigFunction<RewritesConfig> | undefined =>
    fa && fb
      ? async (): Promise<RewritesConfig> => {
          const [ra, rb] = await Promise.all([fa(), fb()]);
          const isObj = (
            r: RewritesConfig
          ): r is { beforeFiles?: Array<any>; afterFiles?: Array<any>; fallback?: Array<any> } =>
            r && !Array.isArray(r);

          if (isObj(ra) || isObj(rb)) {
            const a = isObj(ra) ? ra : { afterFiles: ra ?? [] };
            const b = isObj(rb) ? rb : { afterFiles: rb ?? [] };
            return {
              beforeFiles: [...(b.beforeFiles ?? []), ...(a.beforeFiles ?? [])],
              afterFiles: [...(b.afterFiles ?? []), ...(a.afterFiles ?? [])],
              fallback: [...(b.fallback ?? []), ...(a.fallback ?? [])]
            };
          }
          return [...(rb ?? []), ...(ra ?? [])];
        }
      : fa || fb;

  out.headers = combine(a.headers as ConfigFunction<any[]>, b.headers as ConfigFunction<any[]>);
  out.rewrites = combineRewrites(
    a.rewrites as ConfigFunction<RewritesConfig>,
    b.rewrites as ConfigFunction<RewritesConfig>
  );
  out.redirects = combine(
    a.redirects as ConfigFunction<any[]>,
    b.redirects as ConfigFunction<any[]>
  );

  return out;
}

const target = resolveTarget();
const picked = target === "edge" ? edgeConfig : target === "static" ? staticConfig : nodeConfig;

const finalConfig = merge(baseConfig, picked);
export default finalConfig;

// Dev-only OpenNext Cloudflare helper (don’t ship to prod)
if (process.env.NODE_ENV !== "production" && typeof process !== "undefined") {
  (async () => {
    try {
      const { initOpenNextCloudflareForDev } = await import("@opennextjs/cloudflare");
      initOpenNextCloudflareForDev();
    } catch {}
  })();
}
