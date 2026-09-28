# Complete examples

[Documentation home](../../README.md) · [API reference](../material-table.md)

Copy the example and `data.ts` into a consuming app after installing the library.
These are component examples, not a standalone application.

| File                               | Demonstrates                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------ |
| [data.ts](data.ts)                 | Typed dimension, highlighted metric, rows, and summary.                              |
| [ClientTable.tsx](ClientTable.tsx) | Local sorting, dimension search, pagination, and summary.                            |
| [ExportTable.tsx](ExportTable.tsx) | CSV download callback and ref-based search reset.                                    |
| [ServerTable.tsx](ServerTable.tsx) | Initial fetch, query updates, loading/error handling, and stale-response protection. |

`ServerTable` needs a `loadPage(query, signal)` function supplied by your app.
Define it outside the rendering component or memoize it with `useCallback`.
It must return `{ rows, summary, totalRecords }`, where rows are only the current
page and totalRecords counts all matches. Adapt the zero-based query to your API,
pass the signal to your request client, validate its response, and reject failed
requests. No backend or endpoint is provided by the library.

Run `npm run typecheck:docs` from the repository root. It resolves public imports
to source through `tsconfig.docs.json`, so examples are checked without a build.
It does not execute the examples; use Storybook for interactive component review.
