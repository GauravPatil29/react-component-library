import type { Preview } from '@storybook/react-vite';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme();

const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
  },
};

export default preview;
