import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import autoprefixer from 'autoprefixer'
import { resolve } from 'path'

// Rewrite clean URLs to .html files in dev server
function unitPageRoutes() {
  return {
    name: 'unit-page-routes',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const cleanUrls = ['/skyview', '/cocoa', '/neema'];
        if (cleanUrls.includes(req.url)) {
          req.url = `${req.url}.html`;
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  appType: 'mpa',

  css: {
    postcss: {
      plugins: [
        autoprefixer({ remove: false })
      ],
    },
  },
  plugins: [
    unitPageRoutes(),
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

  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        skyview: resolve(__dirname, 'skyview.html'),
        cocoa: resolve(__dirname, 'cocoa.html'),
        neema: resolve(__dirname, 'neema.html'),
      },
    },
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
