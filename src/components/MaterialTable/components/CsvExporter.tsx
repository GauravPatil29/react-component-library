import { ReactElement, useCallback, useRef, useState } from 'react';
import { Button, Popover } from '@mui/material';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';

import { useTableContext } from '../context';
import { downloadIconSx, exportButtonSx } from '../styles';

/**
 * Download-icon button with a confirmation popover.
 *
 * Clicking the icon opens a MUI Popover anchored below it. The popover contains
 * a single "Export as CSV" button that delegates the actual export to `onExportData`
 * (provided via context), passing the current visible row set. The parent typically
 * uses {@link CSV_HELPER_FUNCTIONS} from `helpers.ts` to build and download the file.
 */
export const CsvExporter = (): ReactElement => {
  const { rows, onExportData } = useTableContext();

  const anchorRef = useRef<SVGSVGElement>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const openPopover = useCallback(() => setIsPopoverOpen(true), []);
  const closePopover = useCallback(() => setIsPopoverOpen(false), []);

  const handleDownload = useCallback(() => {
    setIsPopoverOpen(false);
    onExportData?.(rows);
  }, [onExportData, rows]);

  return (
    <>
      <FileDownloadOutlined
        ref={anchorRef}
        titleAccess='Export as CSV'
        sx={downloadIconSx}
        onClick={openPopover}
      />
      <Popover
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={isPopoverOpen}
        anchorEl={anchorRef.current}
        onClose={closePopover}
      >
        <Button onClick={handleDownload} sx={exportButtonSx}>
          Export as CSV
        </Button>
      </Popover>
    </>
  );
};

CsvExporter.displayName = 'MaterialTable.CsvExporter';
