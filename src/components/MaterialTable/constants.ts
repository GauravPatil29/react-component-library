/** Available page-size options shown in the {@link Pagination} dropdown. */
const ROWS_PER_PAGE_OPTIONS: number[] = [10, 25, 50, 100];

/** Initial page size — always the first (smallest) entry in {@link ROWS_PER_PAGE_OPTIONS}. */
const DEFAULT_ROWS_PER_PAGE: number = ROWS_PER_PAGE_OPTIONS[0];

/** Minimum cell width for the dimension (group-by) column. */
const DIMENSION_CELL_MIN_WIDTH = '12.5rem';

/** Minimum cell width for a regular metric column. */
const METRIC_CELL_MIN_WIDTH = '7.8125rem';

/** Fixed body height when `scrollable` is enabled, and the minimum body height at all times. */
const TABLE_BODY_HEIGHT = '28.125rem';

export {
  ROWS_PER_PAGE_OPTIONS,
  DEFAULT_ROWS_PER_PAGE,
  DIMENSION_CELL_MIN_WIDTH,
  METRIC_CELL_MIN_WIDTH,
  TABLE_BODY_HEIGHT,
};
