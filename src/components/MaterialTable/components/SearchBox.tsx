import React, { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { Input, InputAdornment } from '@mui/material';
import ClearOutlined from '@mui/icons-material/ClearOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';

import { useTableContext } from '../context';
import { searchInputSx, searchAdornmentIconSx } from '../styles';

/**
 * Debounced text input for filtering table rows.
 *
 * Architecture:
 * 1. Keystrokes update local state (`searchValue`) immediately for responsive UI feedback.
 * 2. A `setTimeout` debounce waits for `debounceTime` ms of inactivity before propagating
 *    the value to context via `onSearchChange`.
 * 3. The clear (✕) button immediately resets both local and context state. A `isClearingRef`
 *    flag suppresses the debounce effect on that same render so `onSearchChange` is not
 *    called a second time after the timer elapses.
 *
 * The first render is skipped (`isInitialMount` ref) to avoid dispatching an empty-string
 * search on mount.
 *
 * The component also syncs back when context `searchText` changes externally (e.g. via the
 * imperative ref), keeping the input in lockstep with programmatic updates.
 */
export const SearchBox = (): ReactElement => {
  const { tableKey, debounceTime, searchText, onSearchChange } = useTableContext();

  /** Local mirror of the input value — updated on every keystroke. */
  const [searchValue, setSearchValue] = useState(searchText);

  /** Prevents the debounce effect from firing on the initial mount. */
  const isInitialMount = useRef(true);

  /**
   * Prevents the debounce effect from firing a redundant `onSearchChange('')` when the clear
   * button has already dispatched directly. Set to `true` before `setSearchValue('')`
   * and consumed (reset to `false`) on the next effect run.
   */
  const isClearingRef = useRef(false);

  /** Updates local state on each keystroke; UI stays responsive. */
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchValue(event.target.value);
  }, []);

  /** Immediately clears both local and context search text. */
  const clearSearch = useCallback((): void => {
    if (searchValue) {
      isClearingRef.current = true;
      setSearchValue('');
      onSearchChange('');
    }
  }, [searchValue, onSearchChange]);

  /** Debounce: propagates to context only after the user stops typing. */
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (isClearingRef.current) {
      isClearingRef.current = false;
      return;
    }
    // Context updates (including imperative search) are already applied.
    if (searchValue === searchText) return;
    const handler = setTimeout(() => {
      onSearchChange(searchValue);
    }, debounceTime);
    return () => clearTimeout(handler);
  }, [debounceTime, searchValue, searchText, onSearchChange]);

  /** Syncs back from context when `searchText` is set externally (e.g. via imperative ref). */
  useEffect(() => {
    setSearchValue(searchText);
  }, [searchText]);

  return (
    <Input
      disableUnderline
      size='small'
      placeholder='Search...'
      value={searchValue}
      onChange={handleChange}
      data-testid={`${tableKey}-table-head-bar-search-input`}
      sx={searchInputSx}
      startAdornment={
        <InputAdornment position='start'>
          <SearchOutlined sx={searchAdornmentIconSx} />
        </InputAdornment>
      }
      endAdornment={
        <InputAdornment position='end'>
          <ClearOutlined sx={searchAdornmentIconSx} onClick={clearSearch} />
        </InputAdornment>
      }
    />
  );
};

SearchBox.displayName = 'MaterialTable.SearchBox';
