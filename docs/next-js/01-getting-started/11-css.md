# CSS

Next.js provides several ways to style your application using CSS, including:

* [CSS Modules](#css-modules)
* [Global CSS](#global-css)
* [External Stylesheets](#external-stylesheets)
* [Tailwind CSS](/docs/app/guides/tailwind-css.md)
* [Sass](/docs/app/guides/sass.md)
* [CSS-in-JS](/docs/app/guides/css-in-js.md)

## CSS Modules

CSS Modules locally scope CSS by generating unique class names. This allows you to use the same class in different files without worrying about naming collisions.

To start using CSS Modules, create a new file with the extension `.module.css` and import it into any component inside the `app` directory:

```css filename="app/blog/blog.module.css"
.blog {
  padding: 24px;
}
```

```tsx filename="app/blog/page.tsx" switcher
import styles from './blog.module.css'

export default function Page() {
  return <main className={styles.blog}></main>
}
```

```jsx filename="app/blog/page.js" switcher
import styles from './blog.module.css'

export default function Layout() {
  return <main className={styles.blog}></main>
}
```

## Global CSS

You can use global CSS to apply styles across your application.

Create a `app/global.css` file and import it in the root layout to apply the styles to **every route** in your application:

```css filename="app/global.css"
body {
  padding: 20px 20px 60px;
  max-width: 680px;
  margin: 0 auto;
}
```

```tsx filename="app/layout.tsx" switcher
// These styles apply to every route in the application
import './global.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

```jsx filename="app/layout.js" switcher
// These styles apply to every route in the application
import './global.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

> **Good to know:** Global styles can be imported into any layout, page, or component inside the `app` directory. However, since Next.js uses React's built-in support for stylesheets to integrate with Suspense, this currently does not remove stylesheets as you navigate between routes which can lead to conflicts. We recommend using global styles for *truly* global CSS, and [CSS Modules](#css-modules) for scoped CSS.

## External stylesheets

Stylesheets published by external packages can be imported anywhere in the `app` directory, including colocated components:

```tsx filename="app/layout.tsx" switcher
import 'bootstrap/dist/css/bootstrap.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="container">{children}</body>
    </html>
  )
}
```

```jsx filename="app/layout.js" switcher
import 'bootstrap/dist/css/bootstrap.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="container">{children}</body>
    </html>
  )
}
```

> **Good to know:** In React 19, `<link rel="stylesheet" href="..." />` can also be used. See the [React `link` documentation](https://react.dev/reference/react-dom/components/link) for more information.

## Ordering and Merging

Next.js optimizes CSS during production builds by automatically chunking (merging) stylesheets. The **order of your CSS** depends on the **order you import styles in your code**.

For example, `base-button.module.css` will be ordered before `page.module.css` since `<BaseButton>` is imported before `page.module.css`:

```tsx filename="page.tsx" switcher
import { BaseButton } from './base-button'
import styles from './page.module.css'

export default function Page() {
  return <BaseButton className={styles.primary} />
}
```

```jsx filename="page.js" switcher
import { BaseButton } from './base-button'
import styles from './page.module.css'

export default function Page() {
  return <BaseButton className={styles.primary} />
}
```

```tsx filename="base-button.tsx" switcher
import styles from './base-button.module.css'

export function BaseButton() {
  return <button className={styles.primary} />
}
```

```jsx filename="base-button.js" switcher
import styles from './base-button.module.css'

export function BaseButton() {
  return <button className={styles.primary} />
}
```

### Recommendations

To keep CSS ordering predictable:

* Try to contain CSS imports to a single JavaScript or TypeScript entry file
* Import global styles and Tailwind stylesheets in the root of your application.
* Use CSS Modules instead of global styles for nested components.
* Use a consistent naming convention for your CSS modules. For example, using `<name>.module.css` over `<name>.tsx`.
* Extract shared styles into shared components to avoid duplicate imports.
* Turn off linters or formatters that auto-sort imports like ESLint’s [`sort-imports`](https://eslint.org/docs/latest/rules/sort-imports).
* You can use the [`cssChunking`](/docs/app/api-reference/config/next-config-js/cssChunking.md) option in `next.config.js` to control how CSS is chunked.

## Development vs Production

* In development (`next dev`), CSS updates apply instantly with [Fast Refresh](/docs/architecture/fast-refresh.md).
* In production (`next build`), all CSS files are automatically concatenated into **many minified and code-split** `.css` files, ensuring the minimal amount of CSS is loaded for a route.
* CSS still loads with JavaScript disabled in production, but JavaScript is required in development for Fast Refresh.
* CSS ordering can behave differently in development, always ensure to check the build (`next build`) to verify the final CSS order.

## Next Steps

Learn more about the alternatives ways you can use CSS in your application.

- [Tailwind CSS](/docs/app/guides/tailwind-css.md)
  - Style your Next.js Application using Tailwind CSS.
- [Sass](/docs/app/guides/sass.md)
  - Style your Next.js application using Sass.
- [CSS-in-JS](/docs/app/guides/css-in-js.md)
  - Use CSS-in-JS libraries with Next.js

<!-- markdownlint-configure-file
{
  "MD004": false,
  "MD007": false,
  "MD059": false
}
-->
