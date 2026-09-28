import { DIMENSION_CELL_MIN_WIDTH, TABLE_BODY_HEIGHT } from './constants';

// ── Colour tokens ──────────────────────────────────────────────────────────────

/** Primary brand blue — used for the "Summary" row label. */
const COLOR_PRIMARY = '#4952FF';

/** Accent blue — used for interactive text (links, clickable cells, hint icon). */
const COLOR_INTERACTIVE = '#5D66FA';

/** Surface background — used for inputs and info bars. */
const COLOR_SURFACE = '#f6f6f6';

/** Semi-transparent overlay — used for the loading backdrop (50% opacity). */
const COLOR_OVERLAY = '#F6F6F680';

/** MUI `sx` styles for the outer `TableContainer` in `index.tsx`. */
export const tableContainerSx = { position: 'relative' } as const;

/** Shared flex row layout applied to `DataRow`, `AggregationRow`, and `HeaderRow`. */
export const tableRowSx = {
  display: 'flex',
  flexDirection: 'row',
} as const;

/** Base styles for the "Summary" label cell in `AggregationRow`. */
export const summaryCellBaseSx = {
  display: 'flex',
  fontWeight: 500,
  minWidth: DIMENSION_CELL_MIN_WIDTH,
  py: 1.25,
  px: 0.625,
  fontSize: '0.875rem',
  alignItems: 'center',
  wordBreak: 'break-word',
  justifyContent: 'start',
  color: COLOR_PRIMARY,
} as const;

/**
 * Shared base for any blue link-like interactive text.
 * Extended by `breadcrumbSubPathSx` and `clickableCellTextSx`.
 */
export const linkTextBaseSx = {
  fontWeight: 500,
  fontSize: '0.875rem',
  color: COLOR_INTERACTIVE,
  '&:hover': {
    cursor: 'pointer',
    textDecoration: 'underline',
  },
} as const;

/** Styles for a single clickable path segment in `Breadcrumbs`. */
export const breadcrumbSubPathSx = linkTextBaseSx;

/** Styles for the ">" delimiter between `Breadcrumbs` path segments. */
export const breadcrumbDelimiterSx = {
  mx: 0.5,
  fontSize: '0.875rem',
} as const;

/** Styles for the small ID sub-label beneath the `Breadcrumbs` trail. */
export const breadcrumbIdBoxSx = {
  fontSize: '0.625rem',
  mt: 1.25,
} as const;

/** Styles for the download icon in `CsvExporter`. */
export const downloadIconSx = { cursor: 'pointer', position: 'relative' } as const;

/** Styles for the "Export as CSV" button inside the `CsvExporter` popover. */
export const exportButtonSx = { py: 0.625, px: 1.25 } as const;

/** Small font-size utility used by default `DataCell` text. */
export const fontSm = { fontSize: '0.875rem' } as const;

/**
 * Styles for the blue link-style text in a clickable dimension `DataCell`.
 * Extends `linkTextBaseSx` with a hover background instead of underline.
 */
export const clickableCellTextSx = {
  ...linkTextBaseSx,
  '&:hover': {
    cursor: 'pointer',
    borderRadius: '0.25rem',
    bgcolor: 'action.hover',
  },
} as const;

/** Styles for the outer `TableRow` in the `Empty` component. */
export const emptyRowSx = {
  width: 1,
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  // Match the body's minHeight so the empty message is vertically centred within the fixed body area.
  minHeight: TABLE_BODY_HEIGHT,
} as const;

/** Styles for the single `TableCell` in the `Empty` component. */
export const emptyCellSx = {
  flex: 1,
  border: 0,
  display: 'flex',
  fontSize: '1rem',
  alignItems: 'center',
} as const;

/**
 * Base styles for all data cells rendered by `DataCell`.
 * Highlight colours and clickable styles are merged on top of this base per cell.
 * `py: 1.25` = 10px = 0.625rem; `px: 0.625` = 5px = 0.3125rem (MUI default 8px spacing unit).
 */
export const dataCellSx = {
  display: 'flex',
  userSelect: 'none',
  py: 1.25,
  px: 0.625,
  alignItems: 'center',
  wordBreak: 'break-word',
} as const;

/**
 * Base styles for all header cells rendered by `HeaderCell`.
 * Column-specific flex, minWidth, and alignment are merged in per cell.
 */
export const headerCellSx = {
  py: 1.25,
  px: 0.625,
  display: 'flex',
  alignItems: 'center',
} as const;

/** Styles for the primary label text inside a `HeaderCell`. */
export const headerCellLabelSx = {
  fontWeight: 500,
  display: 'flex',
  fontSize: '0.875rem',
  alignItems: 'center',
  flexDirection: 'column',
  justifyContent: 'center',
} as const;

/** Styles for the optional secondary label inside a `HeaderCell`. */
export const headerCellSubLabelSx = {
  fontSize: '0.8rem',
  ml: 0.5,
} as const;

/** Styles for the `Input` element in `SearchBox`. */
export const searchInputSx = {
  py: 0.625,
  px: 1.25,
  fontSize: '0.875rem',
  overflow: 'clip',
  borderRadius: '0.3125rem',
  bgcolor: COLOR_SURFACE,
  '& .MuiInput-input': { p: 0 },
  '& .MuiInputAdornment-positionEnd': { cursor: 'pointer' },
} as const;

/** Styles for the search and clear icons in `SearchBox`. */
export const searchAdornmentIconSx = { fontSize: '1.25rem' } as const;

/** Styles for the outer `Stack` container of `TableHeadBar`. */
export const headBarContainerSx = { my: 1 } as const;

/** Styles for the toolbar row inside `TableHeadBar`. */
export const headBarToolbarSx = { p: 1 } as const;

/** Styles for the "Data" label text in `TableHeadBar`. */
export const headBarLabelSx = { fontSize: '0.875rem', fontWeight: 500 } as const;

/** Styles for the drill-down hint info bar in `TableHeadBar`. */
export const headBarInfoBarSx = {
  py: 0.625,
  px: 1,
  overflow: 'clip',
  borderRadius: '0.25rem',
  width: 'fit-content',
  bgcolor: COLOR_SURFACE,
} as const;

/** Styles for the rotated lightbulb hint icon in `TableHeadBar`. */
export const headBarHintIconSx = {
  color: COLOR_INTERACTIVE,
  fontSize: '1rem',
  transform: 'rotate(180deg)',
} as const;

/** Styles for the hint text in `TableHeadBar`. */
export const headBarHintTextSx = { fontSize: '0.875rem', fontWeight: 400 } as const;

/** Styles for the absolute-positioned loading overlay in `TableLoadingView`. */
export const fullOverlaySx = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  position: 'absolute',
  alignItems: 'center',
  flexDirection: 'column',
  justifyContent: 'center',
  bgcolor: COLOR_OVERLAY,
} as const;

/**
 * Base styles shared by both left and right scroll indicators.
 * The left/right position, opacity, and gradient `maskImage` are applied separately
 * in {@link getScrollIndicatorStyles} since they differ between the two sides.
 */
export const scrollIndicatorBaseSx = {
  zIndex: 2,
  top: '5rem',
  content: '""',
  height: '70%',
  width: '6.25rem',
  position: 'absolute',
  pointerEvents: 'none',
  maskComposite: 'intersect',
  backdropFilter: 'blur(6.25rem)',
  WebkitMaskComposite: 'source-in',
  WebkitBackdropFilter: 'blur(6.25rem)',
  transition: 'opacity 0.3s ease-in-out',
} as const;
