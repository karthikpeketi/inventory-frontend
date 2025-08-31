import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
    base: './', // important for Vercel
  plugins: [
    react(), 
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Inventory360',
        short_name: 'Inventory360',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0a0a0a',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    port: 5173,
    host: true,
    // For development, we'll use HTTP instead of HTTPS
    // Google OAuth will work with localhost HTTP in development
  },
})
