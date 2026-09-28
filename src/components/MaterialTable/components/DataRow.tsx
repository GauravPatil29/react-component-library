import React, { memo, ReactElement } from 'react';
import { TableRow } from '@mui/material';

import { RowData } from '../types';
import { DataCell } from './DataCell';
import { useTableContext } from '../context';
import { tableRowSx } from '../styles';

interface DataRowProps {
  /** Unique key used for `data-testid`. */
  rowKey: string;
  /** The data for this row. */
  row: RowData;
}

/**
 * Renders a single table row containing one `DataCell` per column.
 *
 * If a dimension column is configured it is rendered as the first cell with
 * `isDimensionCell` set to `true`, which enables drill-down interactions.
 * All remaining metric columns follow in order.
 *
 * Wrapped in `React.memo` to prevent unnecessary re-renders when only
 * unrelated context state (e.g. loading flag, page) changes.
 */
const DataRowInner = ({ rowKey, row }: DataRowProps): ReactElement => {
  const { columns, dimension } = useTableContext();

  return (
    <TableRow data-testid={rowKey} sx={tableRowSx}>
      {dimension && (
        <DataCell
          row={row}
          isDimensionCell
          column={dimension}
          key={`${rowKey}-group-by-data-cell`}
          cellKey={`${rowKey}-group-by-data-cell`}
        />
      )}
      {columns.map((column, index) => (
        <DataCell
          row={row}
          column={column}
          key={`${rowKey}-data-cell-${index}`}
          cellKey={`${rowKey}-data-cell-${index}`}
        />
      ))}
    </TableRow>
  );
};

export const DataRow = memo(DataRowInner);
DataRow.displayName = 'MaterialTable.DataRow';
