# React Library

A TypeScript React component library built with Material UI. **MaterialTable**
provides sorting, search, pagination, summaries, CSV export callbacks, and drill-down.

## Documentation

- [Getting started](docs/getting-started.md) — installation, imports, theming, and troubleshooting.
- [MaterialTable API](docs/material-table.md) — props, columns, behavior, and limitations.
- [Complete examples](docs/examples/README.md) — client data, server data, and export/ref integration.
- [Contributing](CONTRIBUTING.md) — development, project structure, and adding components.
- [Testing](docs/testing.md) — conventions, coverage, and tool choices.

See [GitHub automation](docs/automation.md) for master tags, production Storybook,
and PR testing-site deployment setup.

## Install locally

For repository development, use Node.js 24.21 or later in the Node 24 line and npm:

```sh
npm ci
npm pack
```

This creates `react-library-0.1.0.tgz`. Install it in your React application using
the actual file path, plus any missing peer dependencies:

```sh
npm install /path/to/react-library-0.1.0.tgz
npm install react@^19 react-dom@^19 @mui/material@^7 @mui/icons-material@^7 @emotion/react@^11 @emotion/styled@^11
```

Keep your app's existing compatible React version. The package declares React
18.2/19, MUI 7, and Emotion 11 as peers. Development currently uses React 19.
The package name is a local placeholder; these instructions do not assume a
published npm release.

## Quick start

```tsx
import { MaterialTable, ColumnStyle, ColumnType } from 'react-library';

export function Products() {
  return (
    <MaterialTable
      tableKey='products'
      isLoading={false}
      paginationType='client'
      defaultSort={{ key: 'units', direction: 'desc' }}
      dimension={{
        apiKey: 'name',
        label: 'Product',
        category: 'Catalog',
        flex: 2,
        type: ColumnType.STRING,
        style: ColumnStyle.DEFAULT,
        sortable: true,
      }}
      columns={[
        {
          apiKey: 'units',
          label: 'Units sold',
          flex: 1,
          type: ColumnType.INTEGER,
          style: ColumnStyle.DEFAULT,
          sortable: true,
        },
      ]}
      data={{ rows: [{ name: 'Notebook', units: 42 }], summary: {}, totalRecords: 1 }}
    />
  );
}
```

The dimension is the first column and the field searched in client mode.
Metric columns belong in `columns`. [Complete typed example](docs/examples/ClientTable.tsx).

## Explore and develop

```sh
npm run storybook       # http://localhost:6006
npm run dev             # Rebuild library on source changes
npm test
npm run lint
npm run format:check
npm run typecheck
npm run typecheck:docs  # Check complete documentation examples
```

Storybook includes default, summary, loading, empty, scrollable, clickable, and
highlighted examples. Its export callback logs to the Actions panel.

## Package output

`npm run build` produces ESM, CommonJS, declarations, and source maps in `dist/`.
Both `react-library` and `react-library/MaterialTable` are public import paths.
React, MUI, and Emotion remain external peers.

`npm pack` runs TypeScript validation and the library build. Lint, tests, and
Storybook checks are separate; see [packaging and release](CONTRIBUTING.md#packaging-and-release).
The repository has no license file yet. Choose a license, package name, and
repository metadata before publishing.
