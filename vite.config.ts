import {defineConfig} from 'vite';

export default defineConfig({
  optimizeDeps: {
    include: ['@headlessui/react', 'clsx', 'react-use', 'typographic-base'],
  },
  resolve: {
    alias: [{ find: '~', replacement: '/app'}]
  }
});
