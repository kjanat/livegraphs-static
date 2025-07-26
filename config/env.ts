export const isProd = process.env.NODE_ENV === "production";

// Cloudflare Workers/Pages CI signals
// (Workers Build sets WORKERS_CI=1; Pages sets CF_PAGES=1 and extras like CF_PAGES_URL)
export const isCloudflare =
  process.env.WORKERS_CI === "1" || process.env.CF_PAGES === "1" || process.env.CF_PAGES === "true";

// GitHub Actions in general
const isGitHubActions = process.env.GITHUB_ACTIONS === "true";

// Heuristics that this *specific* GH run is for GitHub Pages (static hosting).
// You control this best by setting GITHUB_PAGES="true" in your Pages workflow/job.
// Fallback heuristics included but don’t rely on them forever.
export const isGitHubPages =
  process.env.GITHUB_REPOSITORY === "kjanat/livegraphs-static" ||
  process.env.GITHUB_PAGES === "true" ||
  !!process.env.ACTIONS_DEPLOYMENT_BLOB_URL || // present on pages deploy jobs
  (isGitHubActions && /pages/i.test(process.env.GITHUB_WORKFLOW ?? ""));

// Final target selector with an override
export type Target = "edge" | "node" | "static";
export function resolveTarget(): Target {
  const explicit = (process.env.DEPLOY_TARGET || "").toLowerCase();
  if (explicit === "edge" || explicit === "node" || explicit === "static") return explicit;
  if (isCloudflare) return "edge";
  if (isGitHubPages) return "static";
  // Default for generic servers/containers
  return "node";
}
