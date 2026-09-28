import React, { memo, ReactElement, useCallback, useMemo } from 'react';
import { Typography, TableCell } from '@mui/material';

import { Breadcrumbs } from './Breadcrumbs';
import { useTableContext } from '../context';
import { Column, ColumnStyle, DimensionColumn, RowData } from '../types';
import { renderCellValue, getHighlightStyles } from '../helpers';
import { DIMENSION_CELL_MIN_WIDTH, METRIC_CELL_MIN_WIDTH } from '../constants';
import { fontSm, dataCellSx, clickableCellTextSx } from '../styles';

interface DataCellProps {
  /** Unique key used for `data-testid`. */
  cellKey: string;
  /** The data row this cell belongs to. */
  row: RowData;
  /** Column definition describing type, alignment, style, highlight, etc. */
  column: Column | DimensionColumn;
  /** `true` when rendered inside `AggregationRow` — applies bold font weight. */
  isSummaryRow?: boolean;
  /** `true` for the first (dimension / group-by) cell in a row. */
  isDimensionCell?: boolean;
}

/**
 * Renders a single value cell inside a `DataRow` or `AggregationRow`.
 *
 * Behaviour varies by the combination of `isDimensionCell` and the column's `ColumnStyle`:
 *
 * | `isDimensionCell` | `ColumnStyle`  | Rendering                                   |
 * |-------------------|---------------|---------------------------------------------|
 * | `false`           | any            | Plain Typography with small font            |
 * | `true`            | `CLICKABLE`    | Blue link text; onClick → drill-down        |
 * | `true`            | `BREADCRUMBS`  | Breadcrumbs component; per-segment click    |
 * | `true`            | `DEFAULT`      | Plain Typography (same as non-dimension)    |
 *
 * Conditional highlighting (`pass` / `fail` / `neutral`) is applied by merging the
 * column's `DataHighlighter` styles into the cell's base `CSSProperties` via
 * `getHighlightStyles`.
 *
 * Wrapped in `React.memo` — rows can contain hundreds of cells; memo prevents
 * re-renders when only unrelated context state changes.
 */
const DataCellInner = ({
  cellKey,
  row,
  column,
  isSummaryRow,
  isDimensionCell,
}: DataCellProps): ReactElement => {
  const { onDrillDownClick } = useTableContext();

  /** Cell-level `sx` with conditional highlight colours merged in. */
  const cellSx = useMemo(
    () =>
      getHighlightStyles(column, row, {
        ...dataCellSx,
        flex: column.flex,
        fontWeight: isSummaryRow ? 'bold' : 'normal',
        minWidth: isDimensionCell ? DIMENSION_CELL_MIN_WIDTH : METRIC_CELL_MIN_WIDTH,
        justifyContent: isDimensionCell ? 'start' : (column.align ?? 'center'),
      }),
    [column, row, isSummaryRow, isDimensionCell],
  );

  /** Resolved display value — custom formatter takes precedence over `formatCellValue`. */
  const value = useMemo(() => {
    return renderCellValue(column, row);
  }, [column, row]);

  /** Triggers drill-down navigation. Only callable from dimension cells. */
  const handleDrillDown = useCallback(
    (selectedPath?: string[]): void => {
      if (isDimensionCell) onDrillDownClick?.({ row }, selectedPath);
    },
    [isDimensionCell, onDrillDownClick, row],
  );

  /** Extra right-padding when the column is sortable — aligns content with the header sort icon. */
  const sortPaddingSx = useMemo(
    () => ({ pr: column.sortable ? '1.625rem' : 'unset' }),
    [column.sortable],
  );

  /**
   * Picks the correct inner content based on dimension-cell state and column style.
   * - `CLICKABLE`   → blue text with onClick
   * - `BREADCRUMBS` → hierarchical path with per-segment click
   * - default       → plain text
   */
  const renderContent = (): ReactElement => {
    if (isDimensionCell && column.style === ColumnStyle.CLICKABLE) {
      return (
        <Typography
          component='span'
          sx={[clickableCellTextSx, sortPaddingSx]}
          onClick={() => handleDrillDown()}
        >
          {value}
        </Typography>
      );
    }

    if (isDimensionCell && column.style === ColumnStyle.BREADCRUMBS && !row.drilldownDisabled) {
      const id = row[column.additionalData?.idKey as string] ?? '';
      return <Breadcrumbs id={id} value={value} sx={sortPaddingSx} onClick={handleDrillDown} />;
    }

    return (
      <Typography component='span' sx={[fontSm, sortPaddingSx]}>
        {value}
      </Typography>
    );
  };

  return (
    <TableCell data-testid={cellKey} sx={cellSx}>
      {renderContent()}
    </TableCell>
  );
};

export const DataCell = memo(DataCellInner);
DataCell.displayName = 'MaterialTable.DataCell';
