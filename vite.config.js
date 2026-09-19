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
      injectRegister: null,
      includeAssets: ['lulu_aurelian_logo.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Lulu Aurelian Estate',
        short_name: 'Lulu Aurelian',
        description: 'Luxury Living & Escapes',
        theme_color: '#BB8525',
        background_color: '#F3F3E6',
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
    // Target modern browsers for smaller output
    target: 'es2020',
    // Raise chunk warning threshold (portals are intentionally large)
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      input: {
        main:    resolve(__dirname, 'index.html'),
        skyview: resolve(__dirname, 'skyview.html'),
        cocoa:   resolve(__dirname, 'cocoa.html'),
        neema:   resolve(__dirname, 'neema.html'),
      },

      output: {
        // Manual chunk splitting — keeps initial bundle small
        manualChunks(id) {
          // React core + router
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          // Google OAuth
          if (id.includes('@react-oauth') || id.includes('oauth2')) {
            return 'vendor-oauth';
          }
          // AOS animations (defer load)
          if (id.includes('node_modules/aos')) {
            return 'vendor-aos';
          }
          // Helmet
          if (id.includes('react-helmet')) {
            return 'vendor-helmet';
          }
          // Lucide icons
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }
          // All other node_modules into a general vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
          // Staff/Manager portals — lazy loaded, split into their own chunk
          if (id.includes('ManagerPortal') || id.includes('AgentPortal') || id.includes('SuitePasscodes')) {
            return 'chunk-portals';
          }
          // Guest portal
          if (id.includes('GuestPortal') || id.includes('PortalDashboard')) {
            return 'chunk-dashboard';
          }
          // Checkout + payment
          if (id.includes('CheckoutPage') || id.includes('SuccessModal')) {
            return 'chunk-checkout';
          }
          // Booking forms
          if (id.includes('BookingForm') || id.includes('BookingSummary') || id.includes('CustomCalendar')) {
            return 'chunk-booking';
          }
          // Content Studio + CMS
          if (id.includes('ContentStudio')) {
            return 'chunk-cms';
          }
        }
      }
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

