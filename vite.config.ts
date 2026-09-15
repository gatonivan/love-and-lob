import { defineConfig, defaultExclude } from 'vitest/config'
import react from '@vitejs/plugin-react'
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
          gsap: ['gsap', '@gsap/react'],
          vendor: ['react', 'react-dom', 'react-router', 'zustand'],
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    // tests/live hits the real network (the current Sweatpals host page) and
    // must never gate `pnpm test` — an outage, an offline machine, or a
    // legitimately quiet week would turn a workflow that commits to main red
    // for no real reason. Run it deliberately via `pnpm test:live`.
    exclude: [...defaultExclude, 'tests/live/**'],
  },
})
