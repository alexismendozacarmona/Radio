import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const LOGO = 'https://clasicosdelreggaeton.com/sitepad-data/uploads/2026/02/logoclasx.jpg';

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),

    // PWA plugin for service worker and caching
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}']
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Clásicos del Reggaetón',
        short_name: 'Clásicos',
        description: 'Radio online premium de los mejores clásicos del reggaetón',
        theme_color: '#000A1F',
        background_color: '#000A1F',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: LOGO,
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: LOGO,
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      }
    }),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
