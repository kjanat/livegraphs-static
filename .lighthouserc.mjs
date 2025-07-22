export const ci = {
  collect: {
    staticDistDir: "./out",
    numberOfRuns: 3
  },
  assert: {
    preset: "lighthouse:recommended",
    assertions: {
      "categories:performance": ["warn", { minScore: 0.9 }],
      "categories:accessibility": ["error", { minScore: 0.95 }],
      "categories:best-practices": ["warn", { minScore: 0.9 }],
      "categories:seo": ["warn", { minScore: 0.9 }],
      "categories:pwa": "off",
      "unused-javascript": "off",
      "unused-css-rules": "off",
      "uses-long-cache-ttl": "off",
      "uses-http2": "off"
    }
  },
  upload: {
    target: "temporary-public-storage"
  }
};
