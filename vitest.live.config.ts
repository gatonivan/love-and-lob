import { defineConfig } from 'vitest/config'

// Separate config for tests/live: hits the real network (the current
// Sweatpals host page) and must never run as part of `pnpm test` (see
// vite.config.ts, which excludes tests/live from its default suite). Run
// deliberately via `pnpm test:live`.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/live/**/*.test.js'],
  },
})
