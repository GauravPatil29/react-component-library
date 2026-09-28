import React, { memo, ReactElement, useCallback, useMemo } from 'react';
import Typography from '@mui/material/Typography';
import { TableCell, TableSortLabel } from '@mui/material';

import { Column, DimensionColumn } from '../types';
import { useTableContext } from '../context';
import { toggleSortDirection } from '../helpers';
import { DIMENSION_CELL_MIN_WIDTH, METRIC_CELL_MIN_WIDTH } from '../constants';
import { headerCellSx, headerCellLabelSx, headerCellSubLabelSx } from '../styles';

interface HeaderCellProps {
  /** Unique key used for `data-testid` attributes. */
  cellKey: string;
  /** Column definition (label, apiKey, sortable, flex, etc.). */
  column: Column | DimensionColumn;
  /** `true` when this cell represents the dimension / group-by column. */
  isGroupByColumn?: boolean;
}

/**
 * A single sortable column header.
 *
 * Wraps MUI's `TableSortLabel` inside a `TableCell`. Click behaviour:
 * - Clicking an **inactive** column → sort descending (`desc` first).
 * - Clicking the **already-active** column → toggles direction (`desc` ↔ `asc`).
 * - `column.sortable === false` disables the label; clicks are ignored.
 *
 * The cell flex-sizes itself using `column.flex` and applies a wider `minWidth`
 * for the dimension (group-by) column. The optional `column.tooltipMessage` is
 * surfaced as a native `title` attribute.
 *
 * Wrapped in `React.memo` to avoid unnecessary re-renders on unrelated state changes.
 */
const HeaderCellInner = ({ cellKey, column, isGroupByColumn }: HeaderCellProps): ReactElement => {
  const { activeSort, onSortChange } = useTableContext();

  const isActive = activeSort?.key === column.apiKey;
  const sortDirection = isActive ? activeSort.direction : 'asc';

  const handleSortClick = useCallback(() => {
    if (column.sortable) onSortChange(toggleSortDirection(column, activeSort));
  }, [column, onSortChange, activeSort]);

  const cellSx = useMemo(
    () => ({
      ...headerCellSx,
      flex: column.flex,
      minWidth: isGroupByColumn ? DIMENSION_CELL_MIN_WIDTH : METRIC_CELL_MIN_WIDTH,
      justifyContent: column.headerAlign ?? 'center',
    }),
    [column.flex, column.headerAlign, isGroupByColumn],
  );

  return (
    <TableCell
      sx={cellSx}
      title={column.tooltipMessage}
      sortDirection={sortDirection}
      data-testid={cellKey}
    >
      <TableSortLabel
        active={isActive}
        onClick={handleSortClick}
        direction={sortDirection}
        disabled={!column.sortable}
        data-testid={`${cellKey}-sort-label`}
      >
        <Typography component='span' sx={headerCellLabelSx} data-testid={`${cellKey}-label`}>
          {column.label}
          {/* Optional secondary label (e.g. a benchmark or unit of measure) */}
          {column.subLabel && (
            <Typography
              component='span'
              data-testid={`${cellKey}-sub-label`}
              sx={headerCellSubLabelSx}
            >
              {column.subLabel}
            </Typography>
          )}
        </Typography>
      </TableSortLabel>
    </TableCell>
  );
};

export const HeaderCell = memo(HeaderCellInner);
HeaderCell.displayName = 'MaterialTable.HeaderCell';
