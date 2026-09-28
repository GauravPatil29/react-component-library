import { useRef } from 'react';
import { Button } from '@mui/material';
import {
  MaterialTable,
  CSV_HELPER_FUNCTIONS as csv,
  type MaterialTableRef,
  type RowData,
} from 'react-library';
import { columns, data, dimension } from './data';

export function ExportTable() {
  const ref = useRef<MaterialTableRef>(null);

  function exportRows(rows: RowData[]) {
    const document = csv.createCsvWithHeaders(columns, dimension);
    // These are all filtered/sorted client rows, including rows on other pages.
    csv.downloadCsv(
      [csv.getCsvHeaderRow(document), ...csv.getCsvDataRows(document, rows)],
      csv.generateFileNameFromDimension(dimension),
    );
  }

  return (
    <MaterialTable
      ref={ref}
      tableKey='export-products'
      columns={columns}
      dimension={dimension}
      data={data}
      defaultSort={{ key: 'units', direction: 'desc' }}
      paginationType='client'
      isLoading={false}
      onExportData={exportRows}
      additionalHeaderComponent={
        <Button onClick={() => ref.current?.onSearchChange('')}>Reset search</Button>
      }
    />
  );
}
