import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()] as any,
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup/test-utils.tsx'],
    css: true,
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['e2e/**', 'src/tests/{e2e,performance,accessibility,security}/**', 'node_modules/**'],
    watch: false,
    passWithNoTests: false,
    snapshotFormat: { escapeString: true },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}); 