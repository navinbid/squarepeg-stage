import {defineConfig} from 'cypress';

export default defineConfig({
  // component: {
  //   devServer: {
  //     framework: 'react',
  //     bundler: 'vite',
  //   },
  // },
  // component: {
  //   devServer: {
  //     framework: "react",
  //     bundler: "webpack",
  //   },
  // },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'https://squarepegsupply.myshopify.com/',
    experimentalStudio: true,
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
