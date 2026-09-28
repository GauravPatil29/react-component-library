import { ReactElement, useMemo } from 'react';
import { Box, CircularProgress } from '@mui/material';

import { useTableContext } from '../context';
import { fullOverlaySx } from '../styles';

export const TableLoadingView = (): ReactElement => {
  const { tableKey, isLoading } = useTableContext();

  const overlaySx = useMemo(
    () => ({ ...fullOverlaySx, display: isLoading ? ('flex' as const) : ('none' as const) }),
    [isLoading],
  );

  return (
    <Box data-testid={`${tableKey}-table-loading-view`} sx={overlaySx}>
      <CircularProgress />
    </Box>
  );
};

TableLoadingView.displayName = 'MaterialTable.TableLoadingView';
