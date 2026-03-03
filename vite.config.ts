import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  base: '/love-and-lob/',
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
})
