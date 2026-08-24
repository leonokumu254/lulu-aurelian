import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import autoprefixer from 'autoprefixer'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  appType: 'spa',

  css: {
    postcss: {
      plugins: [
        autoprefixer({ remove: false })
      ],
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      includeAssets: ['lulu_aurelian_logo.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Lulu Aurelian Staff Console',
        short_name: 'Staff Console',
        description: 'Lulu Aurelian Estate Operations Desk',
        theme_color: '#BB8525',
        background_color: '#12100C',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/lulu_aurelian_logo.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],

  build: {
    outDir: 'dist-staff',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'staff.html')
      }
    }
  },

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
