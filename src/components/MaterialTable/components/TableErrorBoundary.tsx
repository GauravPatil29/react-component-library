import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

interface Props {
  children: ReactNode;
  /** `tableKey` is included in the error log for easier debugging. */
  tableKey?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React error boundary that catches render-time errors in any MaterialTable child.
 *
 * When an error is caught:
 * 1. `getDerivedStateFromError` sets `hasError` so the fallback UI is rendered.
 * 2. `componentDidCatch` logs the error with the table key so it can be identified
 *    in monitoring tools (e.g. Sentry, DataDog).
 *
 * Placed outside `MaterialTableProvider` in `index.tsx` so that errors inside
 * the provider itself are also caught.
 *
 * @example
 * // Errors surface as a localised fallback rather than crashing the page:
 * <TableErrorBoundary tableKey="campaigns-table">
 *   <MaterialTableProvider ...>...</MaterialTableProvider>
 * </TableErrorBoundary>
 */
export class TableErrorBoundary extends Component<Props, State> {
  static displayName = 'MaterialTable.ErrorBoundary';

  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const key = this.props.tableKey ? `:${this.props.tableKey}` : '';
    console.error(`[MaterialTable${key}] render error`, error, info.componentStack);
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <Box
        data-testid={`${this.props.tableKey ?? 'material-table'}-error`}
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '10rem',
        }}
      >
        <Typography color='error' fontSize='0.875rem'>
          Unable to render table. Please try refreshing the page.
        </Typography>
      </Box>
    );
  }
}
