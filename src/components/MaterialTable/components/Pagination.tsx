import React, { ReactElement, useCallback } from 'react';
import { TablePagination } from '@mui/material';

import { useTableContext } from '../context';
import { ROWS_PER_PAGE_OPTIONS } from '../constants';

/**
 * Wraps MUI's `TablePagination` with table context bindings.
 *
 * Renders a standard pagination bar with:
 * - Rows-per-page dropdown (options from `ROWS_PER_PAGE_OPTIONS`).
 * - First / Previous / Next / Last page navigation buttons.
 * - Current range display (e.g. "11–20 of 100").
 *
 * All navigation is disabled while `isLoading` is `true` to prevent
 * competing requests during server-side pagination.
 */
export const Pagination = (): ReactElement => {
  const { page, onPageChange, rowsPerPage, onRowsPerPageChange, totalRowCount, isLoading } =
    useTableContext();

  /** Parses the selected value string back to an integer and dispatches to context. */
  const handleRowsPerPageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      onRowsPerPageChange(Number.parseInt(event.target.value, 10));
    },
    [onRowsPerPageChange],
  );

  /** Forwards the new page index to the context. */
  const handlePageChange = useCallback(
    (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number): void => {
      onPageChange(newPage);
    },
    [onPageChange],
  );

  return (
    <TablePagination
      page={page}
      component='div'
      showLastButton
      showFirstButton
      disabled={isLoading}
      count={totalRowCount}
      rowsPerPage={rowsPerPage}
      onPageChange={handlePageChange}
      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      onRowsPerPageChange={handleRowsPerPageChange}
    />
  );
};

Pagination.displayName = 'MaterialTable.Pagination';
