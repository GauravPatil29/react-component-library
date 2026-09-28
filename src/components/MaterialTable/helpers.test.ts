import { describe, expect, it } from 'vitest';
import { CSV_HELPER_FUNCTIONS as csv, formatCellValue, renderCellValue } from './helpers';
import { ColumnStyle, ColumnType, type Column, type DimensionColumn } from './types';

const column: Column = {
  apiKey: 'value',
  label: 'Value',
  flex: 1,
  type: ColumnType.STRING,
  style: ColumnStyle.DEFAULT,
};

describe('CSV helpers', () => {
  it.each([
    ['plain', 'plain'],
    ['a,b', '"a,b"'],
    ['say "hello"', '"say ""hello"""'],
    ['line\nbreak', '"line\nbreak"'],
    [null, ''],
    [0, '0'],
  ])('escapes data value %j', (value, expected) => {
    expect(csv.getCsvDataRows(csv.createCsvWithHeaders([column]), [{ value }])).toEqual([expected]);
  });

  it('escapes headers, puts dimensions first, and avoids duplicate dimension columns', () => {
    const dimension: DimensionColumn = {
      ...column,
      apiKey: 'name',
      label: 'Name, full',
      category: 'People',
      dataFormatter: undefined,
    };
    const result = csv.createCsvWithHeaders([column, { ...column, apiKey: 'name' }], dimension);
    expect(csv.getCsvHeaderRow(result)).toBe('"Name, full",Value');
    expect(csv.getSummaryRow(result, { value: 42 })).toBe('Summary,42');
  });

  it('uses custom dimension and metric formatters in exports', () => {
    const dimension: DimensionColumn = {
      ...column,
      apiKey: 'name',
      category: 'People',
      dataFormatter: (col, row) => `${col.category}: ${row.name}`,
    };
    const metric = {
      ...column,
      dataFormatter: (_col: Column, row: Record<string, unknown>) => `USD ${row.value}`,
    };
    const result = csv.createCsvWithHeaders([metric], dimension);
    expect(csv.getCsvDataRows(result, [{ name: 'Ada', value: 42 }])).toEqual([
      'People: Ada,USD 42',
    ]);
    expect(renderCellValue(dimension, { name: 'Ada' })).toBe('People: Ada');
  });
});

describe('cell formatting', () => {
  it('handles missing and invalid numbers without displaying NaN', () => {
    const numeric = { ...column, type: ColumnType.INTEGER };
    expect(formatCellValue(numeric, {})).toBe('');
    expect(formatCellValue(numeric, { value: 'invalid' })).toBe('0');
    expect(formatCellValue(numeric, { value: 1234 })).toBe((1234).toLocaleString());
    expect(formatCellValue({ ...column, type: ColumnType.PERCENTAGE }, { value: ' ' })).toBe(
      '0.0%',
    );
  });
});
