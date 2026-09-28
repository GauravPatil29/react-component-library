import { CSSProperties } from 'react';

import {
  Column,
  ColumnType,
  DataHighlighter,
  DataType,
  DimensionColumn,
  RowData,
  Sort,
} from './types';
import { scrollIndicatorBaseSx } from './styles';

/**
 * Safely coerces any {@link DataType} value to an integer.
 * Returns `0` for nullish, empty, or unparseable inputs.
 */
const parseInteger = (value: DataType): number => {
  if (value === null || value === undefined || value === '' || `${value}`.trim() === '') {
    return 0;
  }
  const parsed = Number.parseInt(`${value}`, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

/**
 * Produces the next {@link Sort} state when a column header is clicked.
 *
 * - Clicking a **new** column always starts with `'desc'`.
 * - Clicking the **currently sorted** column toggles the direction.
 */
const toggleSortDirection = (column: Column | DimensionColumn, activeSort: Sort): Sort => {
  if (activeSort.key !== column.apiKey) {
    return { key: column.apiKey, direction: 'desc' };
  }
  return {
    key: column.apiKey,
    direction: activeSort.direction === 'desc' ? 'asc' : 'desc',
  };
};

/**
 * Formats a row's raw value for display based on the column's {@link ColumnType}.
 *
 * - `STRING`     → `String(value)`
 * - `INTEGER`    → locale-formatted number (e.g. `"1,234"`)
 * - `PERCENTAGE` → value + `"%"` suffix (defaults to `"0.0%"` for blank values)
 */
const formatCellValue = (column: Column | DimensionColumn, row: RowData): string => {
  const value = row?.[column?.apiKey];
  if (value === null || value === undefined) return '';

  switch (column.type) {
    case ColumnType.PERCENTAGE:
      return `${value}`.trim() === '' ? '0.0%' : `${value}%`;
    case ColumnType.INTEGER:
      return parseInteger(value).toLocaleString();
    case ColumnType.STRING:
    default:
      return String(value);
  }
};

/**
 * Maps a {@link DataHighlighter} condition result to the matching style key
 * on the {@link DataHighlighter} interface.
 */
const HIGHLIGHT_STYLE_KEYS: Record<
  string,
  keyof Pick<DataHighlighter, 'passStyle' | 'failStyle' | 'neutralStyle'>
> = {
  pass: 'passStyle',
  fail: 'failStyle',
  neutral: 'neutralStyle',
} as const;

/**
 * Merges conditional highlight CSS into a cell's base {@link CSSProperties}.
 *
 * If the column has no `highlight` config, `baseStyles` is returned as-is.
 * Otherwise the column's `condition` is evaluated and the matching style
 * (`passStyle` / `failStyle` / `neutralStyle`) is spread on top of the base.
 */
const getHighlightStyles = (
  column: Column | DimensionColumn,
  row: RowData,
  baseStyles: CSSProperties,
): CSSProperties => {
  if (!('highlight' in column) || !column.highlight) return baseStyles;
  const result = column.highlight.condition(column, row);
  const styleKey = HIGHLIGHT_STYLE_KEYS[result];
  const highlightStyle = (styleKey && column.highlight[styleKey]) ?? {};
  return { ...baseStyles, ...highlightStyle };
};

// ── CSV helpers ────────────────────────────────────────────────────────────────

/** A CSV column header with an optional dimension marker. */
type CsvHeaders = (Column | DimensionColumn) & {
  /** `true` if this header represents the dimension column. */
  isDimension?: boolean;
};

/** In-memory CSV representation used by the export helpers. */
interface CSV {
  headers: CsvHeaders[];
  rows: string[];
}

/**
 * Initialises a {@link CSV} structure with ordered headers.
 * The dimension column (if present) is placed first, followed by metric columns.
 */
const createCsvWithHeaders = (columns: Column[], dimension?: DimensionColumn): CSV => {
  const headers: CsvHeaders[] = [];
  if (dimension) headers.push({ ...dimension, isDimension: true });
  for (const col of columns) {
    if (col.apiKey !== dimension?.apiKey) headers.push(col);
  }
  return { headers, rows: [] };
};

/**
 * Resolves the display value for a single cell inside a CSV row.
 * Prefers the column's `dataFormatter` over the default {@link formatCellValue}.
 */
const renderCellValue = (column: Column | DimensionColumn, row: RowData): DataType => {
  if ('category' in column) {
    if (column.dataFormatter) return column.dataFormatter(column, row);
  } else if (column.dataFormatter) {
    return column.dataFormatter(column, row);
  }
  return formatCellValue(column, row);
};

const getCellCsvValue = (row: RowData, header: CsvHeaders): string =>
  String(renderCellValue(header, row));

/**
 * Wraps a CSV field in double-quotes and escapes embedded quotes whenever
 * the value contains commas, quotes, or newlines (RFC 4180).
 */
const escapeCsvValue = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
};

/** Returns the comma-separated header row string. */
const getCsvHeaderRow = (csv: CSV): string =>
  csv.headers.map((h) => escapeCsvValue(h.label)).join(',');

/**
 * Returns a summary row string, using `"Summary"` as the label for the
 * dimension cell so it is clearly identifiable in the exported file.
 */
const getSummaryRow = (csv: CSV, row: RowData): string =>
  csv.headers
    .map((h) => (h.isDimension ? 'Summary' : escapeCsvValue(getCellCsvValue(row, h))))
    .join(',');

/** Converts every {@link RowData} object into a comma-separated CSV row string. */
const getCsvDataRows = (csv: CSV, rows: RowData[]): string[] =>
  rows.map((row) => csv.headers.map((h) => escapeCsvValue(getCellCsvValue(row, h))).join(','));

/**
 * Creates a Blob from CSV rows, generates a temporary `<a>` download link,
 * clicks it programmatically, and immediately cleans up both the element and the
 * object URL to avoid memory leaks.
 */
const downloadCsv = (csvRows: string[], filename: string): void => {
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/**
 * Builds a timestamped file name derived from the dimension label.
 *
 * @example
 * generateFileNameFromDimension(dimension) // "ad_units_export_20260925T….csv"
 */
const generateFileNameFromDimension = (dimension?: DimensionColumn): string => {
  const baseName = dimension ? dimension.label.replaceAll(/\s+/g, '_').toLowerCase() : 'data_table';
  const timestamp = new Date().toISOString().replaceAll(/[:.TZ-]/g, '');
  return `${baseName}_export_${timestamp}.csv`;
};

/**
 * Aggregated CSV helper namespace exported for use by parent components that
 * implement their own `onExportData` handler.
 *
 * Typical usage:
 * ```ts
 * onExportData={(rows) => {
 *   const csv = CSV_HELPER_FUNCTIONS.createCsvWithHeaders(columns, dimension);
 *   const header = CSV_HELPER_FUNCTIONS.getCsvHeaderRow(csv);
 *   const dataRows = CSV_HELPER_FUNCTIONS.getCsvDataRows(csv, rows);
 *   CSV_HELPER_FUNCTIONS.downloadCsv([header, ...dataRows],
 *     CSV_HELPER_FUNCTIONS.generateFileNameFromDimension(dimension));
 * }}
 * ```
 */
type CsvHelperFunctions = {
  createCsvWithHeaders: typeof createCsvWithHeaders;
  getCsvHeaderRow: typeof getCsvHeaderRow;
  getSummaryRow: typeof getSummaryRow;
  getCsvDataRows: typeof getCsvDataRows;
  downloadCsv: typeof downloadCsv;
  generateFileNameFromDimension: typeof generateFileNameFromDimension;
};

const CSV_HELPER_FUNCTIONS: CsvHelperFunctions = {
  createCsvWithHeaders,
  getCsvHeaderRow,
  getSummaryRow,
  getCsvDataRows,
  downloadCsv,
  generateFileNameFromDimension,
};

// ── Misc helpers ───────────────────────────────────────────────────────────────

/**
 * Conditional value helper.
 * Returns `value` only when `condition` is `false`; otherwise returns `undefined`.
 */
const returnIfFalse = <T>(condition: boolean, value: T): T | undefined =>
  condition ? undefined : value;

/**
 * Generates CSS for a frosted-glass scroll indicator on either edge of the table.
 *
 * The indicator uses `backdrop-filter: blur` combined with CSS `mask-image`
 * gradients so it softly fades out vertically (top and bottom) and horizontally
 * (towards the visible content). Visibility is driven by an `opacity`
 * transition toggled by the `isVisible` flag.
 *
 * Applied as `&::before` (left) and `&::after` (right) pseudo-elements
 * on the `Paper` wrapper in `index.tsx`.
 *
 * @param direction - Which edge to place the indicator on.
 * @param isVisible - Whether the indicator should be visible.
 */
const getScrollIndicatorStyles = (direction: 'left' | 'right', isVisible: boolean): object => {
  const verticalGradient =
    'linear-gradient(to bottom, transparent, rgba(0,0,0,1) 1.875rem, rgba(0,0,0,1) calc(100% - 1.875rem), transparent)';
  const horizontalGradient =
    direction === 'left'
      ? 'linear-gradient(to right, rgba(0,0,0,1) 20%, rgba(0,0,0,0.3), transparent)'
      : 'linear-gradient(to left, rgba(0,0,0,1) 20%, rgba(0,0,0,0.3), transparent)';

  return {
    ...scrollIndicatorBaseSx,
    [direction]: 0,
    opacity: isVisible ? 1 : 0,
    maskImage: `${verticalGradient}, ${horizontalGradient}`,
    WebkitMaskImage: `${verticalGradient}, ${horizontalGradient}`,
  };
};

export {
  toggleSortDirection,
  formatCellValue,
  renderCellValue,
  getHighlightStyles,
  CSV_HELPER_FUNCTIONS,
  returnIfFalse,
  getScrollIndicatorStyles,
};
