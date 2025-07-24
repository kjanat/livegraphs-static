# useCache

> This feature is currently available in the canary channel and subject to change.

The `useCache` flag is an experimental feature in Next.js that enables the [`use cache` directive](/docs/app/api-reference/directives/use-cache.md) to be used independently of [`cacheComponents`](/docs/app/api-reference/config/next-config-js/cacheComponents.md). When enabled, you can use `use cache` in your application even if `cacheComponents` is turned off.

## Usage

To enable the `useCache` flag, set it to `true` in the `experimental` section of your `next.config.ts` file:

```ts filename="next.config.ts"
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    useCache: true,
  },
}

export default nextConfig
```

When `useCache` is enabled, you can use the following cache functions and configurations:

* The [`use cache` directive](/docs/app/api-reference/directives/use-cache.md)
* The [`cacheLife` function](/docs/app/api-reference/config/next-config-js/cacheLife.md) with `use cache`
* The [`cacheTag` function](/docs/app/api-reference/functions/cacheTag.md)
