import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import MaterialTable, { ColumnStyle, ColumnType, type Column, type DimensionColumn } from './index';

const dimension: DimensionColumn = {
  apiKey: 'name',
  label: 'Product',
  category: 'Catalog',
  flex: 2,
  type: ColumnType.STRING,
  style: ColumnStyle.DEFAULT,
  sortable: true,
  searchable: true,
};

const columns: Column[] = [
  {
    apiKey: 'units',
    label: 'Units sold',
    flex: 1,
    type: ColumnType.INTEGER,
    style: ColumnStyle.DEFAULT,
    sortable: true,
  },
  {
    apiKey: 'growth',
    label: 'Growth',
    flex: 1,
    type: ColumnType.PERCENTAGE,
    style: ColumnStyle.DEFAULT,
    sortable: true,
  },
];

const rows = Array.from({ length: 32 }, (_, index) => ({
  name: `${['Notebook', 'Backpack', 'Desk lamp', 'Water bottle'][index % 4]} ${index + 1}`,
  units: 80 + index * 17,
  growth: (index % 7) * 5 - 10,
}));

const meta = {
  title: 'Components/MaterialTable',
  component: MaterialTable,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A Material UI table with sorting, dimension search, pagination, summary rows, and drill-down callbacks. Interact with the table to inspect callbacks in the Actions panel.',
      },
    },
  },
  args: {
    tableKey: 'products',
    isLoading: false,
    columns,
    dimension,
    data: {
      rows,
      summary: { units: rows.reduce((sum, row) => sum + row.units, 0), growth: 5 },
      totalRecords: rows.length,
    },
    defaultSort: { key: 'units', direction: 'desc' },
    paginationType: 'client',
    debounceTime: 250,
    showSummaryRow: false,
    scrollable: false,
    onChange: fn(),
    onExportData: fn(),
    onDrillDownClick: fn(),
  },
  argTypes: {
    paginationType: { control: false },
    defaultSort: {
      control: false,
      description: 'Initial sort applied on mount; use column headers to change the active sort.',
    },
    page: { control: false },
    additionalHeaderComponent: { control: false },
    onChange: { control: false },
    onExportData: { control: false },
    onDrillDownClick: { control: false },
  },
} satisfies Meta<typeof MaterialTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSummary: Story = {
  args: { showSummaryRow: true },
};

export const Loading: Story = {
  args: { isLoading: true },
};

export const Empty: Story = {
  args: { data: { rows: [], summary: {}, totalRecords: 0 } },
};

export const Scrollable: Story = {
  args: { scrollable: true },
};

export const ClickableDimension: Story = {
  args: { dimension: { ...dimension, style: ColumnStyle.CLICKABLE } },
};

export const HighlightedCells: Story = {
  args: {
    columns: columns.map((column) =>
      column.apiKey === 'growth'
        ? {
            ...column,
            highlight: {
              condition: (_column, row) => (Number(row.growth) >= 0 ? 'pass' : 'fail'),
              passStyle: { backgroundColor: '#e8f5e9', color: '#1b5e20' },
              failStyle: { backgroundColor: '#ffebee', color: '#b71c1c' },
            },
          }
        : column,
    ),
  },
};
