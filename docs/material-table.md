# MaterialTable

[Documentation home](../README.md) · [Complete examples](examples/README.md)

The table presents an optional dimension column followed by metric columns.
The parent owns data fetching, summary calculation, and export.

## Props

| Prop                        | Type                                                                | Required/default | Behavior                                                                  |
| --------------------------- | ------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------- |
| `tableKey`                  | `string`                                                            | Required         | Prefix for test IDs/error logs. Does not reset state; React's `key` does. |
| `isLoading`                 | `boolean`                                                           | Required         | Shows overlay, hides data rows, disables pagination.                      |
| `columns`                   | `Column[]`                                                          | Required         | Metrics in display order; exclude the dimension.                          |
| `data`                      | `TableData`                                                         | Required         | `{ rows, summary, totalRecords }`; use `{}` for an unused summary.        |
| `defaultSort`               | `Sort`                                                              | Required         | Initial sort, read on mount.                                              |
| `paginationType`            | `'client'` or `'server'`                                            | Required         | Selects local processing or parent-managed processing.                    |
| `page`                      | `number`                                                            | `0`              | Initial zero-based page, read on mount.                                   |
| `dimension`                 | `DimensionColumn`                                                   | Omitted          | First column; client search and drill-down operate here.                  |
| `debounceTime`              | `number`                                                            | `0`              | Search debounce in milliseconds.                                          |
| `scrollable`                | `boolean`                                                           | `false`          | Sets body height to `28.125rem` with vertical scrolling.                  |
| `showSummaryRow`            | `boolean`                                                           | `false`          | Displays nonempty, nonzero summary data.                                  |
| `additionalHeaderComponent` | `ReactNode`                                                         | Omitted          | Content next to the toolbar's Data label.                                 |
| `onChange`                  | `(params: OnChangeParams) => void`                                  | Omitted          | User search, sort, page, and page-size changes.                           |
| `onExportData`              | `(rows: RowData[]) => void`                                         | Omitted          | Called after export confirmation; no default download.                    |
| `onDrillDownClick`          | `(params: OnDrillDownClickParams, selectedPath?: string[]) => void` | Omitted          | Dimension click callback.                                                 |

## Public data types

- `DataType`: `string | number | boolean | null | undefined`. Objects and JSX are not cell values.
- `RowData`: map of field names to `DataType`.
- `TableData`: `{ rows: RowData[]; summary: RowData; totalRecords: number }`.
- `Sort`: `{ key: string; direction: SortDirection }`; `SortDirection` is `'asc' | 'desc'`.
- `OnChangeParams`: `{ page: number; sort: Sort; searchText: string; rowsPerPage: number }`.
- `OnDrillDownClickParams`: `{ row: RowData; additionalData?: RowData }`. Current cells send only `row`.
- `PaginationType`: `'client' | 'server'`.
- `DataAlignment`: `'start' | 'end' | 'center'`.
- `MaterialTableProps`, `MaterialTableRef`, `Column`, `DimensionColumn`, and `DataHighlighter` are also public types.

Use `import type` for types. `ColumnType`, `ColumnStyle`, `CSV_HELPER_FUNCTIONS`,
and `DEFAULT_ROWS_PER_PAGE` are runtime exports.

## Columns

| Field            | Type                        | Behavior                                                          |
| ---------------- | --------------------------- | ----------------------------------------------------------------- |
| `apiKey`         | `string`, required          | Row field to display and sort.                                    |
| `label`          | `string`, required          | Header text.                                                      |
| `flex`           | `number`, required          | Relative cell width.                                              |
| `type`           | `ColumnType`, required      | Default formatting.                                               |
| `style`          | `ColumnStyle`, required     | Dimension interaction style; metric cells remain plain.           |
| `subLabel`       | `string`                    | Secondary header text.                                            |
| `align`          | `DataAlignment`             | Metric alignment, default `center`; dimensions use `start`.       |
| `headerAlign`    | `DataAlignment`             | Header alignment, default `center`.                               |
| `sortable`       | `boolean`                   | Enables header sorting when true.                                 |
| `tooltipMessage` | `string`                    | Native header title tooltip.                                      |
| `dataFormatter`  | `(column, row) => DataType` | Overrides display and CSV formatting. Return primitives, not JSX. |
| `highlight`      | `DataHighlighter`           | Conditional metric cell styles.                                   |
| `additionalData` | `RowData`                   | Formatter metadata; `idKey` selects the breadcrumb ID field.      |
| `searchable`     | `boolean`                   | Declared but currently unused.                                    |
| `sortByOverride` | `Sort`                      | Declared but currently unused; sorting uses `apiKey`.             |

`DimensionColumn` excludes `highlight`, requires `category`, and gives its
formatter a `DimensionColumn` argument. `category` is metadata; there is currently
no category selector in the UI.

### Formatting and highlighting

| Enum                    | Default output                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------- |
| `ColumnType.STRING`     | Converts value to text.                                                                 |
| `ColumnType.INTEGER`    | Parses an integer and formats with the runtime locale. Invalid/blank values become `0`. |
| `ColumnType.PERCENTAGE` | Appends `%` without scaling (`25` becomes `25%`). Blank values become `0.0%`.           |

Null/undefined display an empty string before type-specific formatting. Sorting
and search operate on raw values even when a formatter is set.

`highlight.condition(column, row)` returns `'pass'`, `'fail'`, or `'neutral'`.
The matching `passStyle`, `failStyle`, or `neutralStyle` merges into base cell
styles. These are React `CSSProperties`, not MUI `sx` objects.
[data.ts](examples/data.ts) demonstrates highlighting.

## Search, sort, and pagination

| Behavior             | Client mode                                              | Server mode                             |
| -------------------- | -------------------------------------------------------- | --------------------------------------- |
| Supplied rows        | Complete dataset                                         | Current page                            |
| Search               | Case-insensitive trimmed substring on `dimension.apiKey` | Parent handles `searchText`             |
| Sort                 | Numeric numbers; strings via `localeCompare`             | Parent handles `sort`                   |
| Page slicing         | Table slices filtered/sorted rows                        | Supplied rows displayed without slicing |
| Total                | Filtered count                                           | `data.totalRecords`                     |
| Export callback rows | All filtered/sorted rows across pages                    | Supplied page rows                      |

Initial size is `DEFAULT_ROWS_PER_PAGE` (`10`); options are 10, 25, 50, and 100.
User search, sort, or page-size changes reset page to zero. Clicking a new column
sorts descending; clicking the active column toggles direction.

`onChange` does not load initial data. Initialize and fetch your server query in
the parent, with loading/error handling and stale-response protection.
[ServerTable.tsx](examples/ServerTable.tsx) demonstrates an injected loader and `AbortSignal`.

## Summaries and loading

Supply totals in `data.summary` using metric keys. Totals are not calculated or
updated by client filtering. An all-zero/empty summary is hidden. Use a dimension
with summaries: the summary row always reserves its first cell for its label.

Loading hides data rows but may retain the summary. Empty data displays a message
after loading finishes. The render error boundary provides a fallback for child
render errors; display network failures in your parent component.

## Drill-down

`ColumnStyle.DEFAULT` displays text. `CLICKABLE` sends
`onDrillDownClick({ row }, undefined)`; your parent handles navigation/data changes.

`BREADCRUMBS` splits strings on `/` or `|`. Clicking `NY` in `US/NY/NYC` sends
`['US', 'NY']` as the second callback argument. Set
`dimension.additionalData = { idKey: 'id' }` to show a row's `id` below its path.
A truthy `row.drilldownDisabled` renders breadcrumb cells as plain text; it does
not disable `CLICKABLE` cells.

## CSV export

The export icon opens a confirmation popover. Supply `onExportData` to generate
the file. [ExportTable.tsx](examples/ExportTable.tsx) provides a complete example.

| `CSV_HELPER_FUNCTIONS` method               | Result                                                                                                |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `createCsvWithHeaders(columns, dimension?)` | CSV object with headers and empty `rows`. Dimension first; duplicate dimension keys omitted.          |
| `getCsvHeaderRow(csv)`                      | Escaped header string.                                                                                |
| `getCsvDataRows(csv, rows)`                 | Row strings using formatters.                                                                         |
| `getSummaryRow(csv, summary)`               | Summary string with “Summary” in the dimension field.                                                 |
| `generateFileNameFromDimension(dimension?)` | Lowercase label with underscores for whitespace, timestamp, and `.csv`. Default prefix: `data_table`. |
| `downloadCsv(csvRows, filename)`            | Joins lines, creates UTF-8 CSV Blob, clicks a temporary link, revokes object URL. Browser-only.       |

String helpers do not mutate the CSV object's `rows` array. Commas, quotes, and
line feeds trigger quoting; embedded quotes are doubled. Helpers do not neutralize
spreadsheet formulas or specially escape a lone carriage return. Apply any
content policy required by your app before export.

## Ref methods

Attach `useRef<MaterialTableRef>(null)` to the table.

| Method                      | Behavior                                      |
| --------------------------- | --------------------------------------------- |
| `onSearchChange(text)`      | Updates search/input and resets page to zero. |
| `onSortChange(sort)`        | Updates sort, retaining page.                 |
| `onRowsPerPageChange(size)` | Updates size, retaining page.                 |

Methods do not notify `onChange`; fetch/update the parent query separately in
server mode. There is no page setter. Remount via React's `key` to reset all state.
[ExportTable.tsx](examples/ExportTable.tsx) demonstrates resetting search.

## Current limits

- No row selection, editing, virtualization, or arbitrary JSX cell renderer.
- No public localization API for toolbar/pagination labels.
- Export/clear icons and clickable dimension text need further keyboard accessibility work.
- Loading explicitly disables pagination; do not assume all toolbar/header handlers are disabled.
- No general table `sx` prop. Use an app theme, column formatters/highlighting, and `additionalHeaderComponent` for supported customization.
