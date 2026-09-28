import { ReactElement } from 'react';
import { TableCell, TableRow } from '@mui/material';

import { useTableContext } from '../context';
import { emptyRowSx, emptyCellSx } from '../styles';

/**
 * Placeholder row shown when the table has no data to display.
 *
 * Rendered inside `TableBodyContainer` when `rows.length === 0` and the table
 * is not in a loading state. The single cell spans the full width and is
 * vertically centred within the body's minimum height.
 */
export const Empty = (): ReactElement => {
  const { tableKey } = useTableContext();

  return (
    <TableRow data-testid={`${tableKey}-empty-row`} sx={emptyRowSx}>
      <TableCell data-testid={`${tableKey}-empty-cell`} sx={emptyCellSx}>
        No data to display for the selected period or filters
      </TableCell>
    </TableRow>
  );
};

Empty.displayName = 'MaterialTable.Empty';
