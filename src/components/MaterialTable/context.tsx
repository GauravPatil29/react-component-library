import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  MaterialTableContextProps,
  MaterialTableProviderProps,
  MaterialTableRef,
  Sort,
} from './types';
import { DEFAULT_ROWS_PER_PAGE } from './constants';

/**
 * Internal React context — `undefined` when consumed outside the provider tree.
 * Always access via {@link useTableContext}.
 */
const MaterialTableContext = createContext<MaterialTableContextProps | undefined>(undefined);

/**
 * Context provider that owns all table-level state (page, sort, search, rows-per-page)
 * and exposes it — together with derived data (filtered/sorted rows, total count) — to
 * every child component via React Context.
 *
 * @remarks
 * **Client-side pagination** — the provider handles filtering (by dimension column),
 * sorting, and slicing locally. The parent receives all rows at once.
 *
 * **Server-side pagination** — rows are passed through as-is and the parent is notified
 * via `onChange` to fetch the next page.
 *
 * **Callback stabilisation** — `onChange`, `onExportData`, and `onDrillDownClick` are
 * stored in refs so that parent components can safely pass new inline functions on every
 * render without causing context consumers to re-render unnecessarily.
 *
 * **Imperative handle** — exposes setters via `ref` so the parent can programmatically
 * set search text, sort, or page size without triggering `onChange` (useful for
 * URL-driven state restoration).
 *
 * @see {@link useTableContext} to consume this context.
 */
const MaterialTableProvider = forwardRef<MaterialTableRef, MaterialTableProviderProps>(
  ({ children, ...props }, ref) => {
    // ── Local state ──────────────────────────────────────────────────────────
    const [page, setPage] = useState(props.page ?? 0);
    const [searchText, setSearchText] = useState('');
    const [activeSort, setActiveSort] = useState<Sort>(props.defaultSort);
    const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);

    // ── Stable callback refs ─────────────────────────────────────────────────
    // Storing parent callbacks in refs and wrapping them in stable functions
    // prevents context value churn when the parent passes new inline functions.
    const onChangeRef = useRef(props.onChange);
    onChangeRef.current = props.onChange;

    const onExportDataRef = useRef(props.onExportData);
    onExportDataRef.current = props.onExportData;

    const onDrillDownClickRef = useRef(props.onDrillDownClick);
    onDrillDownClickRef.current = props.onDrillDownClick;

    const stableOnChange = useCallback<NonNullable<typeof props.onChange>>(
      (params) => onChangeRef.current?.(params),
      [],
    );

    const stableOnExportData = useCallback<NonNullable<typeof props.onExportData>>(
      (rows) => onExportDataRef.current?.(rows),
      [],
    );

    const stableOnDrillDownClick = useCallback<NonNullable<typeof props.onDrillDownClick>>(
      (params, selectedPath) => onDrillDownClickRef.current?.(params, selectedPath),
      [],
    );

    // ── Change handlers ──────────────────────────────────────────────────────

    /**
     * Resets the page to 0 and notifies the parent via `onChange`.
     * Called by every user interaction except direct page navigation.
     */
    const dispatchChange = useCallback(
      (overrides: { sort?: Sort; searchText?: string; rowsPerPage?: number }) => {
        const params = {
          page: 0,
          sort: overrides.sort ?? activeSort,
          searchText: overrides.searchText ?? searchText,
          rowsPerPage: overrides.rowsPerPage ?? rowsPerPage,
        };
        setPage(0);
        stableOnChange(params);
      },
      [activeSort, searchText, rowsPerPage, stableOnChange],
    );

    /** Updates the sort order and resets to page 0. */
    const onSortChange = useCallback(
      (newActiveSort: Sort) => {
        setActiveSort(newActiveSort);
        dispatchChange({ sort: newActiveSort });
      },
      [dispatchChange],
    );

    /** Updates the search text and resets to page 0. */
    const onSearchChange = useCallback(
      (newSearchText: string) => {
        setSearchText(newSearchText);
        dispatchChange({ searchText: newSearchText });
      },
      [dispatchChange],
    );

    /** Updates rows-per-page and resets to page 0. */
    const onRowsPerPageChange = useCallback(
      (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage);
        dispatchChange({ rowsPerPage: newRowsPerPage });
      },
      [dispatchChange],
    );

    /** Navigates to a specific page without resetting to page 0. */
    const onPageChange = useCallback(
      (newPage: number) => {
        setPage(newPage);
        stableOnChange({ searchText, rowsPerPage, page: newPage, sort: activeSort });
      },
      [activeSort, searchText, rowsPerPage, stableOnChange],
    );

    // ── Derived row set ──────────────────────────────────────────────────────

    /**
     * Processed row set.
     *
     * - **Server pagination** — rows pass through unchanged (parent owns filtering/sorting).
     * - **Client pagination** — rows are filtered by search text against the dimension column,
     *   then sorted by the active sort column/direction.
     */
    const rows = useMemo(() => {
      if (props.paginationType === 'server') return props.data.rows;

      const dimensionKey = props.dimension?.apiKey ?? '';

      return props.data.rows
        .filter((row) => {
          if (!searchText || searchText.trim().length === 0) return true;
          const search = searchText.toLowerCase().trim();
          const value = row[dimensionKey]?.toString().toLowerCase().trim() ?? '';
          return value.includes(search);
        })
        .sort((row1, row2) => {
          const val1 = row1[activeSort.key] ?? '';
          const val2 = row2[activeSort.key] ?? '';

          if (typeof val1 === 'number' && typeof val2 === 'number') {
            return activeSort.direction === 'asc' ? val1 - val2 : val2 - val1;
          }
          if (typeof val1 === 'string' && typeof val2 === 'string') {
            return activeSort.direction === 'asc'
              ? val1.localeCompare(val2)
              : val2.localeCompare(val1);
          }
          // Mixed-type fallback
          if (val1 < val2) return activeSort.direction === 'asc' ? -1 : 1;
          if (val1 > val2) return activeSort.direction === 'asc' ? 1 : -1;
          return 0;
        });
    }, [props.paginationType, props.dimension, props.data.rows, activeSort, searchText]);

    // ── Imperative handle ────────────────────────────────────────────────────

    /**
     * Exposes setters so the parent can programmatically update state without
     * triggering `onChange` — useful for URL-driven state restoration on mount.
     */
    useImperativeHandle(ref, () => ({
      onSortChange: setActiveSort,
      onSearchChange: (newSearchText: string) => {
        setPage(0);
        setSearchText(newSearchText);
      },
      onRowsPerPageChange: setRowsPerPage,
    }));

    // ── Context value ────────────────────────────────────────────────────────

    const contextValue: MaterialTableContextProps = useMemo(
      () => ({
        page,
        rows,
        activeSort,
        searchText,
        rowsPerPage,
        onPageChange,
        onSortChange,
        onSearchChange,
        onRowsPerPageChange,
        summaryRow: props.data.summary ?? {},
        showSummaryRow: props.showSummaryRow ?? false,
        columns: props.columns,
        tableKey: props.tableKey,
        isLoading: props.isLoading,
        dimension: props.dimension,
        onExportData: stableOnExportData,
        debounceTime: props.debounceTime ?? 0,
        scrollable: props.scrollable ?? false,
        paginationType: props.paginationType ?? 'server',
        totalRowCount:
          (props.paginationType === 'server' ? props.data.totalRecords : rows.length) ?? 0,
        onDrillDownClick: stableOnDrillDownClick,
      }),
      [
        page,
        rows,
        activeSort,
        searchText,
        rowsPerPage,
        onPageChange,
        onSortChange,
        onSearchChange,
        onRowsPerPageChange,
        stableOnExportData,
        stableOnDrillDownClick,
        props.data.summary,
        props.data.totalRecords,
        props.columns,
        props.tableKey,
        props.isLoading,
        props.dimension,
        props.scrollable,
        props.debounceTime,
        props.showSummaryRow,
        props.paginationType,
      ],
    );

    return (
      <MaterialTableContext.Provider value={contextValue}>{children}</MaterialTableContext.Provider>
    );
  },
);

MaterialTableProvider.displayName = 'MaterialTableProvider';

/**
 * Consumes {@link MaterialTableContext}.
 *
 * @throws {Error} If called outside a {@link MaterialTableProvider}.
 * @returns The current table context value.
 */
const useTableContext = (): MaterialTableContextProps => {
  const context = useContext(MaterialTableContext);
  if (!context) {
    throw new Error('useTableContext must be used within a MaterialTableProvider');
  }
  return context;
};

export { MaterialTableProvider, useTableContext };
