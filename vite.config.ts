// STQC gate requirement: vitest coverage must be configured with `all: true`
// and an explicit `include`, not left at defaults.
//
// Why: by default, coverage only instruments files some test actually
// imports. A brand-new component nobody wired up or tested yet is then
// simply ABSENT from the coverage report, and diff-cover reports the PR's
// diff as fully covered because it only reports on what's present in the
// report. Verified 2026-09-02: a component with real accessibility issues
// (missing alt text, a click handler with no keyboard support) was
// completely invisible to the coverage gate until `all: true` was set.
//
// CUSTOMIZE: adjust `include`/`exclude` globs to match this repo's actual
// source layout - merge the `test.coverage` block below into your existing
// vite.config.ts rather than overwriting it wholesale.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  preview: { port: 3000 },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    coverage: {
      reporter: ['text', 'lcov'],
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/main.tsx', 'src/setupTests.ts'],
    },
  },
});
