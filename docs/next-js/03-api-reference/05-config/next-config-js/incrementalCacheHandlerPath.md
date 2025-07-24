# Custom Next.js Cache Handler

You can configure the Next.js cache location if you want to persist cached pages and data to durable storage, or share the cache across multiple containers or instances of your Next.js application.

```js filename="next.config.js"
module.exports = {
  cacheHandler: require.resolve('./cache-handler.js'),
  cacheMaxMemorySize: 0, // disable default in-memory caching
}
```

View an example of a [custom cache handler](/docs/app/guides/self-hosting.md#configuring-caching) and learn more about the implementation.

## API Reference

The cache handler can implement the following methods: `get`, `set`, `revalidateTag`, and `resetRequestCache`.

### `get()`

| Parameter | Type     | Description                  |
| --------- | -------- | ---------------------------- |
| `key`     | `string` | The key to the cached value. |

Returns the cached value or `null` if not found.

### `set()`

| Parameter | Type           | Description                      |
| --------- | -------------- | -------------------------------- |
| `key`     | `string`       | The key to store the data under. |
| `data`    | Data or `null` | The data to be cached.           |
| `ctx`     | `{ tags: [] }` | The cache tags provided.         |

Returns `Promise<void>`.

### `revalidateTag()`

| Parameter | Type                   | Description                   |
| --------- | ---------------------- | ----------------------------- |
| `tag`     | `string` or `string[]` | The cache tags to revalidate. |

Returns `Promise<void>`. Learn more about [revalidating data](/docs/app/guides/incremental-static-regeneration.md) or the [`revalidateTag()`](/docs/app/api-reference/functions/revalidateTag.md) function.

### `resetRequestCache()`

This method resets the temporary in-memory cache for a single request before the next request.

Returns `void`.

**Good to know:**

* `revalidatePath` is a convenience layer on top of cache tags. Calling `revalidatePath` will call your `revalidateTag` function, which you can then choose if you want to tag cache keys based on the path.

## Platform Support

| Deployment Option                                                      | Supported         |
| ---------------------------------------------------------------------- | ----------------- |
| [Node.js server](/docs/app/getting-started/deploying.md#nodejs-server) | Yes               |
| [Docker container](/docs/app/getting-started/deploying.md#docker)      | Yes               |
| [Static export](/docs/app/getting-started/deploying.md#static-export)  | No                |
| [Adapters](/docs/app/getting-started/deploying.md#adapters)            | Platform-specific |

Learn how to [configure ISR](/docs/app/guides/self-hosting.md#caching-and-isr) when self-hosting Next.js.

## Version History

| Version   | Changes                                                      |
| --------- | ------------------------------------------------------------ |
| `v14.1.0` | Renamed to `cacheHandler` and became stable.                 |
| `v13.4.0` | `incrementalCacheHandlerPath` support for `revalidateTag`.   |
| `v13.4.0` | `incrementalCacheHandlerPath` support for standalone output. |
| `v12.2.0` | Experimental `incrementalCacheHandlerPath` added.            |
