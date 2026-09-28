import { ReactElement } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { DataCell } from './DataCell';
import { useTableContext } from '../context';
import { tableRowSx, summaryCellBaseSx } from '../styles';

/**
 * Optional summary / totals row pinned above the data rows.
 *
 * Renders only when `showSummaryRow` is `true` AND at least one summary value
 * is non-empty / non-zero. The first cell is a static "Summary" label flex-sized
 * to match the dimension column; the remaining cells are `DataCell`s rendered
 * with `isSummaryRow` to apply bold font weight.
 *
 * @returns The summary row element, or `null` if hidden.
 */
export const AggregationRow = (): ReactElement | null => {
  const { tableKey, columns, summaryRow, showSummaryRow, dimension } = useTableContext();

  const hasSummaryData = Object.values(summaryRow).some(
    (val) => val && val !== 0 && val !== '' && val !== '0',
  );

  if (!showSummaryRow || !hasSummaryData) return null;

  return (
    <TableRow selected data-testid={`${tableKey}-aggregation-row`} sx={tableRowSx}>
      <TableCell
        data-testid={`${tableKey}-aggregation-row-name-cell`}
        sx={[summaryCellBaseSx, { flex: dimension?.flex }]}
      >
        Summary
      </TableCell>
      {columns.map((column, index) => (
        <DataCell
          isSummaryRow
          column={column}
          row={summaryRow}
          key={`${tableKey}-aggregation-row-data-cell-${index}`}
          cellKey={`${tableKey}-aggregation-row-data-cell-${index}`}
        />
      ))}
    </TableRow>
  );
};

AggregationRow.displayName = 'MaterialTable.AggregationRow';
