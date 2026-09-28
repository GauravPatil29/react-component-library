import { memo, ReactElement, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';

import { DataType } from '../types';
import { breadcrumbSubPathSx, breadcrumbDelimiterSx, breadcrumbIdBoxSx } from '../styles';

/**
 * A single clickable path segment (e.g. "US").
 * Wrapped in `memo` — its props are stable when the parent has not re-rendered.
 */
const SubPath = memo(({ path, onClick }: { path: string; onClick: () => void }): ReactElement => (
  <Typography component='span' sx={breadcrumbSubPathSx} onClick={onClick}>
    {path}
  </Typography>
));
SubPath.displayName = 'MaterialTable.Breadcrumbs.SubPath';

/** The ">" separator rendered between consecutive path segments. */
const Delimiter = (): ReactElement => (
  <Typography component='span' sx={breadcrumbDelimiterSx}>
    &gt;
  </Typography>
);

interface BreadcrumbsProps {
  /** Optional ID shown as a small sub-label beneath the breadcrumb trail. */
  id: DataType;
  /** The full path value — split on "/" or "|" to produce individual segments. */
  value: DataType;
  /** Forwarded `sx` from the parent `DataCell` (e.g. right-padding for the sort icon). */
  sx: SxProps<Theme>;
  /** Called with the path segments from root up to and including the clicked segment. */
  onClick: (selectedPath: string[]) => void;
}

/**
 * Renders a hierarchical path (e.g. "US > NY > NYC") where each segment is clickable
 * to trigger drill-down to that level.
 *
 * The `value` is split on `"/"` or `"|"` to produce individual path segments.
 * Clicking a segment calls `onClick` with the path from root up to (and including)
 * that segment, e.g. clicking "NY" yields `["US", "NY"]`.
 */
export const Breadcrumbs = ({ id, value, sx, onClick }: BreadcrumbsProps): ReactElement => {
  const parts = useMemo(() => {
    if (typeof value !== 'string') return [];
    return value.split(/\/|\|/).filter((part) => part.trim() !== '');
  }, [value]);

  /** Builds the sub-path array from root to the clicked segment index. */
  const handleClick = useCallback(
    (index: number): void => {
      onClick(parts.slice(0, index + 1));
    },
    [onClick, parts],
  );

  return (
    <Box sx={sx}>
      {parts.map((part, index) => (
        <span key={`${id}-${index}`} data-testid={`breadcrumb-part-${index}`}>
          <SubPath path={part} onClick={() => handleClick(index)} />
          {/* Render delimiter between segments, not after the last one */}
          {index < parts.length - 1 && <Delimiter />}
        </span>
      ))}
      {/* Optional small ID label beneath the breadcrumb trail */}
      {id && <Box sx={breadcrumbIdBoxSx}>{id}</Box>}
    </Box>
  );
};

Breadcrumbs.displayName = 'MaterialTable.Breadcrumbs';
