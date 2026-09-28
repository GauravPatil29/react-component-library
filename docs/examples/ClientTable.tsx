import { MaterialTable } from 'react-library';
import { columns, data, dimension } from './data';

export function ClientTable() {
  return (
    <MaterialTable
      tableKey='products'
      columns={columns}
      dimension={dimension}
      data={data}
      defaultSort={{ key: 'units', direction: 'desc' }}
      paginationType='client'
      isLoading={false}
      debounceTime={250}
      showSummaryRow
    />
  );
}
