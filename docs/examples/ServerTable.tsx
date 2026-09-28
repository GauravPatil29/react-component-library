import { useEffect, useState } from 'react';
import { Alert } from '@mui/material';
import {
  MaterialTable,
  DEFAULT_ROWS_PER_PAGE,
  type OnChangeParams,
  type TableData,
} from 'react-library';
import { columns, dimension } from './data';

interface ServerTableProps {
  // The app supplies its API adapter. Keep this function stable between renders.
  loadPage: (query: OnChangeParams, signal: AbortSignal) => Promise<TableData>;
}

export function ServerTable({ loadPage }: ServerTableProps) {
  const [query, setQuery] = useState<OnChangeParams>({
    page: 0,
    rowsPerPage: DEFAULT_ROWS_PER_PAGE,
    searchText: '',
    sort: { key: 'units', direction: 'desc' },
  });
  const [data, setData] = useState<TableData>({ rows: [], summary: {}, totalRecords: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await loadPage(query, controller.signal);
        if (!controller.signal.aborted) setData(result);
      } catch (cause) {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : 'Unable to load products');
          setData({ rows: [], summary: {}, totalRecords: 0 });
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [loadPage, query]);

  return (
    <>
      {error && <Alert severity='error'>{error}</Alert>}
      <MaterialTable
        tableKey='server-products'
        columns={columns}
        dimension={dimension}
        data={data}
        defaultSort={{ key: 'units', direction: 'desc' }}
        paginationType='server'
        isLoading={isLoading}
        debounceTime={250}
        onChange={setQuery}
      />
    </>
  );
}
