import { CSSProperties, ReactNode } from 'react';

/** Allowed sort orders for table columns. */
type SortDirection = 'asc' | 'desc';

/**
 * Identifies the currently sorted column and its direction.
 * @property key - The {@link Column.apiKey} of the sorted column.
 * @property direction - Current sort direction.
 */
type Sort = {
  key: string;
  direction: SortDirection;
};

/**
 * How a column's raw value should be parsed and formatted by {@link renderCellValue}.
 */
enum ColumnType {
  STRING = 'string',
  INTEGER = 'integer',
  PERCENTAGE = 'percentage',
}

/**
 * Visual interaction style of a dimension cell.
 *
 * - `DEFAULT`     – plain, non-clickable text.
 * - `CLICKABLE`   – blue link-style text that triggers drill-down on click.
 * - `BREADCRUMBS` – hierarchical path with ">" delimiters; each segment is clickable.
 */
enum ColumnStyle {
  DEFAULT = 'default',
  CLICKABLE = 'clickable',
  BREADCRUMBS = 'breadcrumbs',
}

/** Horizontal text alignment within a cell or header. */
type DataAlignment = 'start' | 'end' | 'center';

/**
 * Conditional cell-level highlighting configuration.
 *
 * `condition` is evaluated for every data cell in the column. The returned result
 * (`'pass'` | `'fail'` | `'neutral'`) picks the corresponding CSS override that is
 * merged onto the cell's base styles.
 */
interface DataHighlighter {
  condition: (column: Column, row: RowData) => 'pass' | 'fail' | 'neutral';
  passStyle?: CSSProperties;
  failStyle?: CSSProperties;
  neutralStyle?: CSSProperties;
}

/**
 * Definition of a single metric (non-dimension) column.
 *
 * @property flex - Flex-grow factor that controls relative column width.
 * @property label - Display text shown in the header.
 * @property apiKey - Field name used to look up the value in {@link RowData}.
 * @property type - How the raw value is parsed / formatted.
 * @property style - Visual interaction style for dimension cells.
 * @property subLabel - Optional secondary label shown beneath the main label.
 * @property align - Horizontal alignment for data cells.
 * @property headerAlign - Horizontal alignment for header cells.
 * @property sortable - Whether clicking the header triggers sorting.
 * @property searchable - Reserved; client search currently uses only the dimension apiKey.
 * @property sortByOverride - Reserved; sorting currently uses the column apiKey.
 * @property tooltipMessage - Tooltip text shown on header hover.
 * @property additionalData - Extra metadata passed to cell renderers.
 * @property highlight - Conditional cell-level highlighting config.
 * @property dataFormatter - Formats a primitive cell/CSV value; JSX is not supported.
 */
interface Column {
  flex: number;
  label: string;
  apiKey: string;
  type: ColumnType;
  style: ColumnStyle;
  subLabel?: string;
  align?: DataAlignment;
  headerAlign?: DataAlignment;
  sortable?: boolean;
  searchable?: boolean;
  sortByOverride?: Sort;
  tooltipMessage?: string;
  additionalData?: RowData;
  highlight?: DataHighlighter;
  dataFormatter?: (column: Column, row: RowData) => DataType;
}

/**
 * The "group-by" / dimension column.
 *
 * Extends {@link Column} but drops `highlight` and narrows `dataFormatter`
 * to accept `DimensionColumn` instead of `Column`.
 * `category` is metadata available to formatters; no category selector is rendered.
 */
interface DimensionColumn extends Omit<Column, 'highlight' | 'dataFormatter'> {
  category: string;
  dataFormatter?: (column: DimensionColumn, row: RowData) => DataType;
}

/** Any value a single table cell may hold. */
type DataType = string | number | boolean | null | undefined;

/** A single table row — keys are column {@link Column.apiKey}s. */
interface RowData {
  [key: string]: DataType;
}

/**
 * Methods the parent can call imperatively through `ref`.
 *
 * Useful when the table's search, sort, or page size needs to be driven externally
 * (e.g. deep-link state restoration) without firing `onChange`.
 */
type MaterialTableRef = {
  onSearchChange: (searchText: string) => void;
  onSortChange: (sort: Sort) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
} | null;

/**
 * Payload sent to the parent `onChange` callback on every user interaction
 * (sort, search, page, rows-per-page change).
 */
interface OnChangeParams {
  page: number;
  sort: Sort;
  searchText: string;
  rowsPerPage: number;
}

/**
 * Payload sent when a user clicks a dimension cell to drill into data.
 * @property row - The clicked row's data.
 * @property additionalData - Optional metadata; current cells send only the row.
 */
interface OnDrillDownClickParams {
  row: RowData;
  additionalData?: RowData;
}

/**
 * Raw data fed into the table.
 * @property rows - Array of row objects.
 * @property summary - Aggregation / summary row values.
 * @property totalRecords - Total row count (used by server-side pagination).
 */
interface TableData {
  rows: RowData[];
  summary: RowData;
  totalRecords: number;
}

/**
 * Pagination strategy.
 *
 * - `'client'` – all rows are passed at once; the table filters, sorts, and slices them locally.
 * - `'server'` – the parent supplies only the current page; total comes from `totalRecords`.
 */
type PaginationType = 'client' | 'server';

/**
 * Public props accepted by the {@link MaterialTable} component.
 *
 * @property tableKey - Unique key used as prefix for all `data-testid` attributes.
 * @property isLoading - Shows the loading overlay, hides rows, and disables pagination.
 * @property columns - Metric column definitions (everything except the dimension).
 * @property data - Row data, summary row, and total record count.
 * @property page - Optional initial page index (defaults to 0).
 * @property defaultSort - Initial sort applied on mount.
 * @property scrollable - Whether the table body is independently scrollable.
 * @property debounceTime - Delay (ms) before the {@link SearchBox} emits `onChange` after typing stops.
 * @property showSummaryRow - Whether to show the aggregation / summary row.
 * @property paginationType - Client-side or server-side pagination strategy.
 * @property dimension - Optional dimension (group-by) column rendered as the first column.
 * @property additionalHeaderComponent - Extra React node rendered inside the header toolbar.
 * @property onChange - Fires whenever page, sort, search, or rows-per-page changes.
 * @property onExportData - Fires when the user clicks "Export as CSV".
 * @property onDrillDownClick - Fires when a dimension cell is clicked for drill-down navigation.
 */
interface MaterialTableProps {
  tableKey: string;
  isLoading: boolean;
  columns: Column[];
  data: TableData;
  page?: number;
  defaultSort: Sort;
  scrollable?: boolean;
  debounceTime?: number;
  showSummaryRow?: boolean;
  paginationType: PaginationType;
  dimension?: DimensionColumn;
  additionalHeaderComponent?: ReactNode;
  onChange?: (params: OnChangeParams) => void;
  onExportData?: (rows: RowData[]) => void;
  onDrillDownClick?: (params: OnDrillDownClickParams, selectedPath?: string[]) => void;
}

/** Props for the internal {@link MaterialTableProvider} wrapper. */
interface MaterialTableProviderProps extends MaterialTableProps {
  children: ReactNode;
}

/** Shape of the React context consumed by every child component via {@link useTableContext}. */
interface MaterialTableContextProps {
  page: number;
  rows: RowData[];
  columns: Column[];
  tableKey: string;
  activeSort: Sort;
  searchText: string;
  isLoading: boolean;
  rowsPerPage: number;
  scrollable: boolean;
  totalRowCount: number;
  debounceTime?: number;
  summaryRow: RowData;
  showSummaryRow?: boolean;
  dimension?: DimensionColumn;
  paginationType: PaginationType;
  onPageChange: (page: number) => void;
  onSortChange: (sort: Sort) => void;
  onSearchChange: (searchText: string) => void;
  onExportData?: MaterialTableProps['onExportData'];
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onDrillDownClick: MaterialTableProps['onDrillDownClick'];
}

export { ColumnType, ColumnStyle };
export type {
  Sort,
  Column,
  RowData,
  DataType,
  TableData,
  SortDirection,
  DataAlignment,
  OnChangeParams,
  PaginationType,
  DimensionColumn,
  DataHighlighter,
  MaterialTableRef,
  MaterialTableProps,
  OnDrillDownClickParams,
  MaterialTableContextProps,
  MaterialTableProviderProps,
};
