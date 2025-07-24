# ppr

> This feature is currently available in the canary channel and subject to change.

Partial Prerendering (PPR) enables you to combine static and dynamic components together in the same route. Learn more about [PPR](/docs/app/getting-started/partial-prerendering.md).

## Using Partial Prerendering

### Incremental Adoption (Version 15)

In Next.js 15, you can incrementally adopt Partial Prerendering in [layouts](/docs/app/api-reference/file-conventions/layout.md) and [pages](/docs/app/api-reference/file-conventions/page.md) by setting the [`ppr`](/docs/app/api-reference/config/next-config-js/ppr.md) option in `next.config.js` to `incremental`, and exporting the `experimental_ppr` [route config option](/docs/app/api-reference/file-conventions/route-segment-config.md) at the top of the file:

```ts filename="next.config.ts" switcher
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    ppr: 'incremental',
  },
}

export default nextConfig
```

```js filename="next.config.js" switcher
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: 'incremental',
  },
}

module.exports = nextConfig
```

```tsx filename="app/page.tsx" switcher
import { Suspense } from "react"
import { StaticComponent, DynamicComponent, Fallback } from "@/app/ui"

export const experimental_ppr = true

export default function Page() {
  return {
     <>
      <StaticComponent />
      <Suspense fallback={<Fallback />}>
        <DynamicComponent />
      </Suspense>
     </>
  };
}
```

```jsx filename="app/page.js" switcher
import { Suspense } from "react"
import { StaticComponent, DynamicComponent, Fallback } from "@/app/ui"

export const experimental_ppr = true

export default function Page() {
  return {
     <>
      <StaticComponent />
      <Suspense fallback={<Fallback />}>
        <DynamicComponent />
      </Suspense>
     </>
  };
}
```

> **Good to know**:
>
> * Routes that don't have `experimental_ppr` will default to `false` and will not be prerendered using PPR. You need to explicitly opt-in to PPR for each route.
> * `experimental_ppr` will apply to all children of the route segment, including nested layouts and pages. You don't have to add it to every file, only the top segment of a route.
> * To disable PPR for children segments, you can set `experimental_ppr` to `false` in the child segment.

| Version   | Changes                                     |
| --------- | ------------------------------------------- |
| `v15.0.0` | experimental `incremental` value introduced |
| `v14.0.0` | experimental `ppr` introduced               |

## Learn more about Partial Prerendering- [Partial Prerendering](/docs/app/getting-started/partial-prerendering.md)
  - Learn how to use Partial Prerendering and combine the benefits of static and dynamic rendering.

<!-- markdownlint-configure-file
{
  "MD004": false,
  "MD007": false,
  "MD022": false,
  "MD032": false
}
-->
