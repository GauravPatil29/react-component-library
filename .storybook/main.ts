import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: '@storybook/react-vite',
  core: { disableTelemetry: true },
  viteFinal: (config) => {
    // Support the repository Pages path and nested PR previews.
    config.base = './';
    config.build = {
      ...config.build,
      rolldownOptions: {
        ...config.build?.rolldownOptions,
        onwarn(warning, defaultHandler) {
          // Storybook renders entirely in the browser, so client directives are redundant.
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use client'))
            return;
          defaultHandler(warning);
        },
      },
    };
    return config;
  },
};

export default config;
