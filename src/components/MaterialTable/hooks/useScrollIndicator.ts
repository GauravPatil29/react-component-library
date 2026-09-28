import { useCallback, useEffect, useRef, useState, RefObject } from 'react';

import { RowData } from '../types';

/**
 * Tracks horizontal overflow of the table container and returns boolean flags
 * that drive the frosted-glass edge overlays on the Paper wrapper in `index.tsx`.
 *
 * Scroll state is recalculated:
 * - On every `onScroll` event (the caller passes `checkScroll` as the handler).
 * - On window resize (added/removed via an effect).
 * - Whenever the `rows` array reference changes (new data may expand the scroll width).
 *
 * @param rows - Current table rows; a reference change triggers a re-check.
 * @returns Indicator visibility flags, a ref to attach to the `TableContainer`, and a `checkScroll` callback.
 */
export const useScrollIndicator = (
  rows: RowData[],
): {
  showRightScrollIndicator: boolean;
  showLeftScrollIndicator: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
  checkScroll: () => void;
} => {
  const [showRightScrollIndicator, setShowRightScrollIndicator] = useState(false);
  const [showLeftScrollIndicator, setShowLeftScrollIndicator] = useState(false);

  /** Ref attached to the `TableContainer` so we can read its scroll metrics. */
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Reads the container's scroll metrics and updates both indicator flags.
   *
   * Stable via `useCallback([])` because it only reads a ref — no reactive deps needed.
   * This stability ensures `window.removeEventListener` always matches the registered listener.
   *
   * - Right indicator: visible when content overflows to the right.
   * - Left indicator: visible when the user has scrolled away from the start.
   * - A 1 px tolerance handles sub-pixel rounding in browsers.
   */
  const checkScroll = useCallback((): void => {
    const el = containerRef.current;
    if (!el) return;

    const hasScroll = el.scrollWidth > el.clientWidth;
    const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
    const isAtStart = el.scrollLeft <= 1;

    setShowRightScrollIndicator(hasScroll && !isAtEnd);
    setShowLeftScrollIndicator(hasScroll && !isAtStart);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [rows, checkScroll]);

  return { showRightScrollIndicator, showLeftScrollIndicator, containerRef, checkScroll };
};
