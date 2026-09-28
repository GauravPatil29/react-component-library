import { createRef } from 'react';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import MaterialTable, {
  ColumnStyle,
  ColumnType,
  type MaterialTableProps,
  type MaterialTableRef,
} from './index';

function makeProps(overrides: Partial<MaterialTableProps> = {}): MaterialTableProps {
  return {
    tableKey: 'products',
    isLoading: false,
    columns: [
      {
        apiKey: 'units',
        label: 'Units',
        flex: 1,
        type: ColumnType.INTEGER,
        style: ColumnStyle.DEFAULT,
        sortable: true,
      },
    ],
    dimension: {
      apiKey: 'name',
      label: 'Product',
      category: 'Catalog',
      flex: 2,
      type: ColumnType.STRING,
      style: ColumnStyle.DEFAULT,
      sortable: true,
    },
    data: {
      rows: Array.from({ length: 12 }, (_, index) => ({
        name: `Product ${index + 1}`,
        units: index + 1,
      })),
      summary: { units: 78 },
      totalRecords: 12,
    },
    defaultSort: { key: 'units', direction: 'asc' },
    paginationType: 'client',
    debounceTime: 10,
    ...overrides,
  };
}

const bodyRows = () => within(screen.getByTestId('products-table-body')).getAllByRole('row');

describe('MaterialTable', () => {
  it('sorts and paginates client data, notifying the consumer', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MaterialTable {...makeProps({ onChange })} />);
    expect(bodyRows()).toHaveLength(10);
    expect(bodyRows()[0]).toHaveTextContent('Product 1');
    await user.click(screen.getByRole('button', { name: /go to next page/i }));
    expect(bodyRows()).toHaveLength(2);
    expect(bodyRows()[0]).toHaveTextContent('Product 11');
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1, rowsPerPage: 10 }),
    );
    await user.click(screen.getByRole('button', { name: 'Units' }));
    expect(bodyRows()[0]).toHaveTextContent('Product 12');
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 0, sort: { key: 'units', direction: 'desc' } }),
    );
  });

  it('filters by dimension text and resets pagination', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MaterialTable {...makeProps({ onChange })} />);
    await user.click(screen.getByRole('button', { name: /go to next page/i }));
    await user.type(screen.getByPlaceholderText('Search...'), 'Product 12');
    await waitFor(() => expect(bodyRows()).toHaveLength(1));
    expect(bodyRows()[0]).toHaveTextContent('Product 12');
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 0, searchText: 'Product 12' }),
    );
    await user.clear(screen.getByPlaceholderText('Search...'));
    await waitFor(() => expect(bodyRows()).toHaveLength(10));
  });

  it('changes page size', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MaterialTable {...makeProps({ onChange })} />);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '25' }));
    expect(bodyRows()).toHaveLength(12);
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 0, rowsPerPage: 25 }),
    );
  });

  it('shows empty and loading states and disables pagination during loading', () => {
    const props = makeProps({ data: { rows: [], summary: {}, totalRecords: 0 } });
    const { rerender } = render(<MaterialTable {...props} />);
    expect(screen.getByText(/No data to display/)).toBeVisible();
    rerender(<MaterialTable {...props} isLoading />);
    expect(screen.queryByText(/No data to display/)).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeVisible();
    expect(screen.getByRole('button', { name: /go to next page/i })).toBeDisabled();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders server rows as supplied and delegates page requests', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MaterialTable
        {...makeProps({
          paginationType: 'server',
          page: 1,
          data: { rows: [{ name: 'Server row', units: 99 }], summary: {}, totalRecords: 30 },
          onChange,
        })}
      />,
    );
    expect(bodyRows()).toHaveLength(1);
    expect(screen.getByText('Server row')).toBeVisible();
    await user.click(screen.getByRole('button', { name: /go to next page/i }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));
    expect(screen.getByText('Server row')).toBeVisible();
  });

  it('renders a summary and sends the clicked row to drill-down', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    const onDrillDownClick = vi.fn();
    render(
      <MaterialTable
        {...props}
        showSummaryRow
        dimension={{ ...props.dimension!, style: ColumnStyle.CLICKABLE }}
        onDrillDownClick={onDrillDownClick}
      />,
    );
    expect(screen.getByText('Summary')).toBeVisible();
    expect(screen.getByText('78')).toBeVisible();
    await user.click(screen.getByText('Product 1'));
    expect(onDrillDownClick).toHaveBeenCalledWith({ row: props.data.rows[0] }, undefined);
  });

  it('supports imperative search without notifying onChange', async () => {
    const ref = createRef<MaterialTableRef>();
    const onChange = vi.fn();
    render(<MaterialTable {...makeProps({ onChange })} ref={ref} />);
    act(() => ref.current?.onSearchChange('Product 12'));
    expect(screen.getByPlaceholderText('Search...')).toHaveValue('Product 12');
    expect(bodyRows()).toHaveLength(1);
    await act(() => new Promise((resolve) => setTimeout(resolve, 30)));
    expect(onChange).not.toHaveBeenCalled();
  });
});
