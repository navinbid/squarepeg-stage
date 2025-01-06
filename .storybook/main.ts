import type {StorybookConfig} from '@storybook/react-vite';
const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    {
      name: '@storybook/addon-styling',
      options: {
        // Check out https://github.com/storybookjs/addon-styling/blob/main/docs/api.md
        // For more details on this addon's options.
        postCss: true,
      },
    },
  ],
  typescript: {
    check: true,
    // checkOptions: {},
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  framework: {
    name: '@storybook/react-vite',
    options: {

    },
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: (config) => {
    // Check out https://vitejs.dev/config/
    // For more details on Vite's config.

    if (config.resolve?.alias) {
      // config.resolve.alias['@remix-run/react'] = require.resolve('~/__mocks__/@remix-run/react.tsx');

      config.resolve.alias.push({
        find: '@remix-run/react',
        replacement: require.resolve('../__mocks__/@remix-run/react.tsx'),
      })
    }

    console.log(config.resolve.alias)


    return config;
    // return {
    //   resolve: {
    //     alias: {
    //       '@remix-run/react': require.resolve('../__mocks__/@remix-run/react.tsx'),
    //     }
    //   },
    //   ...config,
    // };
  }
};
export default config;
