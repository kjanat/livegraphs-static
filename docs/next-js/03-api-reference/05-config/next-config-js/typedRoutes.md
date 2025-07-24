# typedRoutes

> This feature is currently experimental and subject to change, it is not recommended for production.

Experimental support for [statically typed links](/docs/app/api-reference/config/typescript.md#statically-typed-links). This feature requires using the App Router as well as TypeScript in your project.

```js filename="next.config.js"
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
}

module.exports = nextConfig
```
