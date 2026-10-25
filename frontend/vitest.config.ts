import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom', // fake browser for React components
    setupFiles: './src/test/setup.ts',
  },
});