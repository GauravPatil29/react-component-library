import { ReactElement } from 'react';
import { TableRow } from '@mui/material';

import { HeaderCell } from './HeaderCell';
import { useTableContext } from '../context';
import { tableRowSx } from '../styles';

/**
 * The single header row rendered inside `<TableHead>`.
 *
 * Mirrors the column order of `DataRow`: an optional dimension `HeaderCell`
 * (with `isGroupByColumn` flag) is rendered first, followed by one `HeaderCell`
 * per metric column.
 */
export const HeaderRow = (): ReactElement => {
  const { tableKey, columns, dimension } = useTableContext();

  return (
    <TableRow data-testid={`${tableKey}-header-row`} sx={tableRowSx}>
      {dimension && (
        <HeaderCell
          key={`${dimension.apiKey}-group-by`}
          cellKey={`${dimension.apiKey}-group-by`}
          column={dimension}
          isGroupByColumn
        />
      )}
      {columns.map((column, index) => (
        <HeaderCell
          key={`${column.apiKey}-header-cell-${index}`}
          cellKey={`${column.apiKey}-header-cell-${index}`}
          column={column}
        />
      ))}
    </TableRow>
  );
};

HeaderRow.displayName = 'MaterialTable.HeaderRow';
