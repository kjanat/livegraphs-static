# mdx-components.js

The `mdx-components.js|tsx` file is **required** to use [`@next/mdx` with App Router](/docs/app/guides/mdx.md) and will not work without it. Additionally, you can use it to [customize styles](/docs/app/guides/mdx.md#using-custom-styles-and-components).

Use the file `mdx-components.tsx` (or `.js`) in the root of your project to define MDX Components. For example, at the same level as `pages` or `app`, or inside `src` if applicable.

```tsx filename="mdx-components.tsx" switcher
import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
  }
}
```

```js filename="mdx-components.js" switcher
export function useMDXComponents(components) {
  return {
    ...components,
  }
}
```

## Exports

### `useMDXComponents` function

The file must export a single function, either as a default export or named `useMDXComponents`.

```tsx filename="mdx-components.tsx" switcher
import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
  }
}
```

```js filename="mdx-components.js" switcher
export function useMDXComponents(components) {
  return {
    ...components,
  }
}
```

## Params

### `components`

When defining MDX Components, the export function accepts a single parameter, `components`. This parameter is an instance of `MDXComponents`.

* The key is the name of the HTML element to override.
* The value is the component to render instead.

> **Good to know**: Remember to pass all other components (i.e. `...components`) that do not have overrides.

## Version History

| Version   | Changes              |
| --------- | -------------------- |
| `v13.1.2` | MDX Components added |

## Learn more about MDX Components- [MDX](/docs/app/guides/mdx.md)
  - Learn how to configure MDX and use it in your Next.js apps.
