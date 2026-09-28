import {
  ColumnStyle,
  ColumnType,
  type Column,
  type DimensionColumn,
  type TableData,
} from 'react-library';

export const dimension: DimensionColumn = {
  apiKey: 'name',
  label: 'Product',
  category: 'Catalog',
  flex: 2,
  type: ColumnType.STRING,
  style: ColumnStyle.DEFAULT,
  sortable: true,
};

export const columns: Column[] = [
  {
    apiKey: 'units',
    label: 'Units sold',
    flex: 1,
    type: ColumnType.INTEGER,
    style: ColumnStyle.DEFAULT,
    sortable: true,
    highlight: {
      condition: (_column, row) => (Number(row.units) >= 40 ? 'pass' : 'neutral'),
      passStyle: { backgroundColor: '#e8f5e9', color: '#1b5e20' },
    },
  },
];

export const data: TableData = {
  rows: [
    { name: 'Notebook', units: 42 },
    { name: 'Backpack', units: 18 },
  ],
  summary: { units: 60 },
  totalRecords: 2,
};
