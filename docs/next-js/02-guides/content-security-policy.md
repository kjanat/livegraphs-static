# How to set a Content Security Policy (CSP) for your Next.js application

[Content Security Policy (CSP)](https://developer.mozilla.org/docs/Web/HTTP/CSP) is important to guard your Next.js application against various security threats such as cross-site scripting (XSS), clickjacking, and other code injection attacks.

By using CSP, developers can specify which origins are permissible for content sources, scripts, stylesheets, images, fonts, objects, media (audio, video), iframes, and more.

<details>
<summary>Examples</summary>

* [Strict CSP](https://github.com/vercel/next.js/tree/canary/examples/with-strict-csp)

</details>

## Nonces

A [nonce](https://developer.mozilla.org/docs/Web/HTML/Global_attributes/nonce) is a unique, random string of characters created for a one-time use. It is used in conjunction with CSP to selectively allow certain inline scripts or styles to execute, bypassing strict CSP directives.

### Why use a nonce?

Even though CSPs are designed to block malicious scripts, there are legitimate scenarios where inline scripts are necessary. In such cases, nonces offer a way to allow these scripts to execute if they have the correct nonce.

### Adding a nonce with Middleware

[Middleware](/docs/app/api-reference/file-conventions/middleware.md) enables you to add headers and generate nonces before the page renders.

Every time a page is viewed, a fresh nonce should be generated. This means that you **must use [dynamic rendering](/docs/app/getting-started/partial-prerendering.md#dynamic-rendering) to add nonces**.

For example:

```ts filename="middleware.ts" switcher
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'nonce-${nonce}';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`
  // Replace newline characters and spaces
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .trim()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  requestHeaders.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue
  )

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  response.headers.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue
  )

  return response
}
```

```js filename="middleware.js" switcher
import { NextResponse } from 'next/server'

export function middleware(request) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'nonce-${nonce}';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`
  // Replace newline characters and spaces
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .trim()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue
  )

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  response.headers.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue
  )

  return response
}
```

By default, Middleware runs on all requests. You can filter Middleware to run on specific paths using a [`matcher`](/docs/app/api-reference/file-conventions/middleware.md#matcher).

We recommend ignoring matching prefetches (from `next/link`) and static assets that don't need the CSP header.

```ts filename="middleware.ts" switcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
```

```js filename="middleware.js" switcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
```

### Reading the nonce

You can read the nonce from a [Server Component](/docs/app/getting-started/server-and-client-components.md) using [`headers`](/docs/app/api-reference/functions/headers.md):

```tsx filename="app/page.tsx" switcher
import { headers } from 'next/headers'
import Script from 'next/script'

export default async function Page() {
  const nonce = (await headers()).get('x-nonce')

  return (
    <Script
      src="https://www.googletagmanager.com/gtag/js"
      strategy="afterInteractive"
      nonce={nonce}
    />
  )
}
```

```jsx filename="app/page.jsx" switcher
import { headers } from 'next/headers'
import Script from 'next/script'

export default async function Page() {
  const nonce = (await headers()).get('x-nonce')

  return (
    <Script
      src="https://www.googletagmanager.com/gtag/js"
      strategy="afterInteractive"
      nonce={nonce}
    />
  )
}
```

## Without Nonces

For applications that do not require nonces, you can set the CSP header directly in your [`next.config.js`](/docs/app/api-reference/config/next-config-js.md) file:

```js filename="next.config.js"
const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
        ],
      },
    ]
  },
}
```

## Version History

We recommend using `v13.4.20+` of Next.js to properly handle and apply nonces.

- [middleware.js](/docs/app/api-reference/file-conventions/middleware.md)
  - API reference for the middleware.js file.
- [headers](/docs/app/api-reference/functions/headers.md)
  - API reference for the headers function.
