import { ReactElement, ReactNode } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LayersOutlined from '@mui/icons-material/LayersOutlined';
import TungstenOutlined from '@mui/icons-material/TungstenOutlined';

import { CsvExporter } from './CsvExporter';
import { SearchBox } from './SearchBox';
import {
  headBarContainerSx,
  headBarToolbarSx,
  headBarLabelSx,
  headBarInfoBarSx,
  headBarHintIconSx,
  headBarHintTextSx,
} from '../styles';

interface TableHeadBarProps {
  additionalHeaderComponent?: ReactNode;
}

export const TableHeadBar = ({ additionalHeaderComponent }: TableHeadBarProps): ReactElement => (
  <Stack spacing={1} sx={headBarContainerSx}>
    <Stack direction='row' alignItems='center' justifyContent='space-between' sx={headBarToolbarSx}>
      <Stack direction='row' alignItems='center' spacing={0.5}>
        <LayersOutlined />
        <Typography sx={headBarLabelSx}>Data</Typography>
        {additionalHeaderComponent}
      </Stack>
      <Stack direction='row' alignItems='center' spacing={1}>
        <SearchBox />
        <CsvExporter />
      </Stack>
    </Stack>
    <Stack direction='row' alignItems='center' spacing={1} sx={headBarInfoBarSx}>
      <TungstenOutlined sx={headBarHintIconSx} />
      <Typography component='span' sx={headBarHintTextSx}>
        Drill into any object by clicking on the table below.
      </Typography>
    </Stack>
  </Stack>
);

TableHeadBar.displayName = 'MaterialTable.TableHeadBar';
