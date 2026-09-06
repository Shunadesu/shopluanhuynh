import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true,
    proxy: {
      '/api': {
        target: 'https://luanhuynhfc.shop',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'https://luanhuynhfc.shop',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
