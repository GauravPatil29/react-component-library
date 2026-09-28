import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    MaterialTable: 'src/components/MaterialTable/index.tsx',
  },
  format: ['esm', 'cjs'],
  target: 'es2021',
  platform: 'browser',
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    '@mui/material',
    '@mui/icons-material',
    '@emotion/react',
    '@emotion/styled',
  ],
  banner: { js: "'use client';" },
});
