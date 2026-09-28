# Getting started

[Documentation home](../README.md)

## Installation

For repository development, use Node.js 24.21 or later in the Node 24 line and npm.
Run `npm ci` to install the versions recorded in `package-lock.json`.

1. Run `npm pack` in this repository.
2. Install the tarball in your app: `npm install /path/to/react-library-0.1.0.tgz`.
3. Install any missing compatible peers. Keep React and React DOM aligned.

| Dependency                             | Declared compatibility |
| -------------------------------------- | ---------------------- |
| `react`, `react-dom`                   | `^18.2.0` or `^19.0.0` |
| `@mui/material`, `@mui/icons-material` | `^7.0.0`               |
| `@emotion/react`, `@emotion/styled`    | `^11.0.0`              |

These ranges describe the package contract. Development currently uses React 19;
there is no automated React-version compatibility matrix. TypeScript consumers
should install React type packages matching their React version.

## Imports

```tsx
import { MaterialTable, ColumnType, ColumnStyle, type Column } from 'react-library';
```

Or use the dedicated entry:

```tsx
import MaterialTable, { type MaterialTableProps } from 'react-library/MaterialTable';
```

The root has a named `MaterialTable` export; the dedicated entry has a default
export. Both expose public table types, enums, CSV helpers, and
`DEFAULT_ROWS_PER_PAGE`. Internal cells, context, styles, and hooks are not public
package exports.

## Theme

The table uses MUI's default theme unless wrapped by a provider. To use an app theme,
copy [ClientTable.tsx](examples/ClientTable.tsx) and [data.ts](examples/data.ts), then:

```tsx
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { ClientTable } from './ClientTable';

const theme = createTheme({ palette: { primary: { main: '#1565c0' } } });

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ClientTable />
    </ThemeProvider>
  );
}
```

`CssBaseline` is optional and affects the whole app. There is no separate library
CSS file to import.

## Runtime and state

The build targets ES2021 and ships no polyfills. Table interactions and CSV
downloads use browser APIs. Bundles include a `use client` directive; in frameworks
with server/client boundaries, put callbacks and ref controls in a client component.

Supply a new data array when data changes so memoized calculations refresh.
Use `paginationType='client'` for a complete dataset or `'server'` for a page
provided by your application.

## Troubleshooting

| Symptom                                        | Check                                                                                                                                        |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Search hides every row                         | Client search needs `dimension.apiKey` pointing to the search field. Metric `searchable` flags are currently unused.                         |
| Export does nothing                            | Provide `onExportData`; it must generate/download the file.                                                                                  |
| Changing `page` or `defaultSort` has no effect | They initialize state on mount. Use ref methods where available, or React's `key` to remount.                                                |
| Summary is missing                             | Set `showSummaryRow` and provide at least one nonempty, nonzero summary value.                                                               |
| Wrong server page                              | Use zero-based pages and fetch initially yourself; `onChange` is not an initial-load callback.                                               |
| Invalid hook call in a linked app              | Check `npm ls react react-dom @mui/material @emotion/react` for duplicate/incompatible peers. A tarball installation matches package output. |

Next: [API reference](material-table.md) and [examples](examples/README.md).
