import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['lulu_aurelian_logo.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Lulu Aurelian Estate',
        short_name: 'Lulu Aurelian',
        description: 'Luxury Living & Escapes',
        theme_color: '#BB8525',
        background_color: '#1D1912',
        display: 'standalone',
        icons: [
          {
            src: 'lulu_aurelian_logo.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
