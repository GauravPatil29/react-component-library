import { ForwardedRef, forwardRef, useMemo } from 'react';
import { Paper, Table, TableContainer, TableHead } from '@mui/material';

import {
  HeaderRow,
  Pagination,
  TableHeadBar,
  TableLoadingView,
  TableBodyContainer,
  TableErrorBoundary,
} from './components';
import { MaterialTableProvider } from './context';
import { useScrollIndicator } from './hooks/useScrollIndicator';
import { getScrollIndicatorStyles } from './helpers';
import { MaterialTableProps, MaterialTableRef } from './types';
import { tableContainerSx } from './styles';

/**
 * Root MaterialTable component. Composes the full table UI:
 *
 * ```
 * ┌─ TableErrorBoundary ────────────────────────────────────┐
 * │  ┌─ MaterialTableProvider (state & context) ──────────┐ │
 * │  │  ┌─ Paper ──────────────────────────────────────┐  │ │
 * │  │  │  TableHeadBar  (search, export, hint bar)    │  │ │
 * │  │  │  ┌─ TableContainer (horizontal scroll) ────┐ │  │ │
 * │  │  │  │  Table                                  │ │  │ │
 * │  │  │  │    TableHead → HeaderRow                │ │  │ │
 * │  │  │  │    TableBodyContainer                   │ │  │ │
 * │  │  │  │      AggregationRow (summary)           │ │  │ │
 * │  │  │  │      DataRow × N                        │ │  │ │
 * │  │  │  │  TableLoadingView (overlay spinner)     │ │  │ │
 * │  │  │  └─────────────────────────────────────────┘ │  │ │
 * │  │  │  Pagination                                  │  │ │
 * │  │  └──────────────────────────────────────────────┘  │ │
 * │  └────────────────────────────────────────────────────┘ │
 * └─────────────────────────────────────────────────────────┘
 * ```
 *
 * @remarks
 * - Scroll indicators (frosted-glass overlays on left/right edges) are generated
 *   as `&::before` / `&::after` pseudo-elements on the Paper wrapper via
 *   {@link getScrollIndicatorStyles}.
 * - Accepts a `ref` ({@link MaterialTableRef}) so the parent can imperatively
 *   set search text, sort, or rows-per-page without triggering `onChange`.
 * - Wrapped in {@link TableErrorBoundary} so any render-time error in a child
 *   shows a graceful fallback instead of crashing the page.
 *
 * @param props - Table configuration, data, and callbacks.
 * @param ref - Optional imperative handle.
 */
const MaterialTable = forwardRef<MaterialTableRef, MaterialTableProps>(
  (props: MaterialTableProps, ref: ForwardedRef<MaterialTableRef>) => {
    const { showRightScrollIndicator, showLeftScrollIndicator, containerRef, checkScroll } =
      useScrollIndicator(props.data.rows);

    const paperSx = useMemo(
      () => ({
        p: 1.25,
        position: 'relative' as const,
        '&::before': getScrollIndicatorStyles('left', showLeftScrollIndicator),
        '&::after': getScrollIndicatorStyles('right', showRightScrollIndicator),
      }),
      [showLeftScrollIndicator, showRightScrollIndicator],
    );

    return (
      <TableErrorBoundary tableKey={props.tableKey}>
        <MaterialTableProvider ref={ref} {...props}>
          <Paper variant='elevation' sx={paperSx}>
            <TableHeadBar additionalHeaderComponent={props.additionalHeaderComponent} />
            <TableContainer
              ref={containerRef}
              data-testid={`${props.tableKey}-table-container`}
              sx={tableContainerSx}
              onScroll={checkScroll}
            >
              <Table>
                <TableHead>
                  <HeaderRow />
                </TableHead>
                <TableBodyContainer />
              </Table>
              {/* Absolute-positioned overlay shown while data is loading */}
              <TableLoadingView />
            </TableContainer>
            <Pagination />
          </Paper>
        </MaterialTableProvider>
      </TableErrorBoundary>
    );
  },
);

MaterialTable.displayName = 'MaterialTable';

// Re-export all public types so consumers can import them directly from 'MaterialTable'.
export { ColumnType, ColumnStyle } from './types';
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
} from './types';

export { CSV_HELPER_FUNCTIONS } from './helpers';
export { DEFAULT_ROWS_PER_PAGE } from './constants';
export default MaterialTable;
