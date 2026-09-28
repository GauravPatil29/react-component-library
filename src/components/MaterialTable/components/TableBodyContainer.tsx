import { ReactElement, useMemo } from 'react';
import { TableBody } from '@mui/material';

import { useTableContext } from '../context';
import { TABLE_BODY_HEIGHT } from '../constants';
import { AggregationRow } from './AggregationRow';
import { DataRow } from './DataRow';
import { Empty } from './Empty';

/**
 * Manages the `<TableBody>` and decides what to render based on loading / empty / data state.
 *
 * | State              | Rendered content                                              |
 * |--------------------|---------------------------------------------------------------|
 * | `isLoading`        | `AggregationRow` only (data rows suppressed during load)      |
 * | `rows.length === 0`| `AggregationRow` + `Empty` placeholder                        |
 * | rows present       | `AggregationRow` + one `DataRow` per visible row              |
 *
 * **Pagination slicing**
 * - Server pagination: the parent supplies only the current page — all rows are rendered.
 * - Client pagination: `rows` are the pre-filtered/sorted set; this component slices them
 *   for the current page using `page * rowsPerPage` to `(page + 1) * rowsPerPage`.
 *
 * **Body styles** adapt dynamically:
 * - Empty state: `display: flex` with centred alignment.
 * - Populated: `display: block` for normal table flow.
 * - `scrollable` prop: fixed `height` + `overflowY: auto` for independent body scrolling.
 */
export const TableBodyContainer = (): ReactElement => {
  const { tableKey, isLoading, rows, scrollable, page, rowsPerPage, paginationType } =
    useTableContext();

  const isEmpty = !isLoading && rows.length === 0;

  const visibleRows =
    paginationType === 'server' ? rows : rows.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const bodySx = useMemo(
    () => ({
      minHeight: TABLE_BODY_HEIGHT,
      height: scrollable ? TABLE_BODY_HEIGHT : 'unset',
      display: isEmpty ? ('flex' as const) : ('block' as const),
      alignItems: isEmpty ? ('center' as const) : ('unset' as const),
      overflowY: scrollable ? ('auto' as const) : ('unset' as const),
      justifyContent: isEmpty ? ('center' as const) : ('unset' as const),
    }),
    [isEmpty, scrollable],
  );

  return (
    <TableBody data-testid={`${tableKey}-table-body`} sx={bodySx}>
      <AggregationRow />
      {!isLoading && isEmpty && <Empty />}
      {!isLoading &&
        !isEmpty &&
        visibleRows.map((row, index) => (
          <DataRow
            key={`${tableKey}-data-row-${index}`}
            rowKey={`${tableKey}-data-row-${index}`}
            row={row}
          />
        ))}
    </TableBody>
  );
};

TableBodyContainer.displayName = 'MaterialTable.TableBodyContainer';
