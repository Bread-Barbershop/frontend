import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: [
    '../components/**/*.stories.@(ts|tsx|js|jsx)',
    '../shared/**/*.stories.@(ts|tsx|js|jsx)',
  ],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  webpackFinal: async config => {
    const imageRule = config.module?.rules?.find(rule => {
      if (!rule || typeof rule !== 'object') return false;
      const test = (rule as { test?: unknown }).test;
      return test instanceof RegExp && test.test('.svg');
    }) as { [key: string]: unknown };

    if (imageRule) {
      imageRule.exclude = /\.svg$/;
    }

    config.module?.rules?.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

export default config;
