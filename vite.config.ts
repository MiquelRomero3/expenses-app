import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        // HTML sempre de la xarxa (mai versió cacheada antiga)
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            // assets versionats (JS/CSS amb hash) → cache-first, ràpids
            urlPattern: /\.(?:js|css|woff2?)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // imatges → cache-first
            urlPattern: /\.(?:png|svg|ico|webp|jpg|jpeg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Expenses App',
        short_name: 'Expenses',
        description: 'Controla les teves despeses fàcilment',
        theme_color: '#6d28d9',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})