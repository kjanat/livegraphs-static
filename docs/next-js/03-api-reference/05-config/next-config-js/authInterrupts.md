# authInterrupts

> This feature is currently available in the canary channel and subject to change.

The `authInterrupts` configuration option allows you to use [`forbidden`](/docs/app/api-reference/functions/forbidden.md) and [`unauthorized`](/docs/app/api-reference/functions/unauthorized.md) APIs in your application. While these functions are experimental, you must enable the `authInterrupts` option in your `next.config.js` file to use them:

```ts filename="next.config.ts" switcher
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
  },
}

export default nextConfig
```

```js filename="next.config.js" switcher
module.exports = {
  experimental: {
    authInterrupts: true,
  },
}
```

- [forbidden](/docs/app/api-reference/functions/forbidden.md)
  - API Reference for the forbidden function.
- [unauthorized](/docs/app/api-reference/functions/unauthorized.md)
  - API Reference for the unauthorized function.
- [forbidden.js](/docs/app/api-reference/file-conventions/forbidden.md)
  - API reference for the forbidden.js special file.
- [unauthorized.js](/docs/app/api-reference/file-conventions/unauthorized.md)
  - API reference for the unauthorized.js special file.
