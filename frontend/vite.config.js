import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 9004,
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
