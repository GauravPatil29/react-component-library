import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['node_modules/', 'dist/', 'coverage/', 'storybook-static/', '.idea/', '.vscode/']),
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
  },
  {
    files: ['src/**/*.{ts,tsx}', '.storybook/**/*.{ts,tsx}', 'docs/examples/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      // TypeScript checks component props; keep Hook checks independent of React Compiler.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
    },
  },
  {
    files: ['*.{js,mjs,cjs,ts}', '.storybook/main.ts', '.github/scripts/*.mjs'],
    languageOptions: { globals: globals.node },
  },
  prettier,
]);
