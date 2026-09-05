import { createRequire } from 'node:module';
import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

const require = createRequire(import.meta.url);
let hasJooxCrypto = true;

try {
  require.resolve('@unlock-music/joox-crypto');
} catch (_) {
  hasJooxCrypto = false;
}

process.env.JOOX_CRYPTO_AVAILABLE = String(hasJooxCrypto);

export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [
    vue(),
    ...(mode === 'test'
      ? []
      : [
          VitePWA({
            registerType: 'autoUpdate',
            injectRegister: false,
            includeAssets: ['favicon.ico', 'loader.js', 'img/icons/*.png', 'img/icons/*.svg'],
            manifest: {
              name: '音乐解锁',
              short_name: '音乐解锁',
              description: '在任何设备上解锁已购的加密音乐！',
              theme_color: '#4DBA87',
              background_color: '#ffffff',
              display: 'standalone',
              start_url: './index.html',
              icons: [
                {
                  src: './img/icons/android-chrome-192x192.png',
                  sizes: '192x192',
                  type: 'image/png',
                },
                {
                  src: './img/icons/android-chrome-512x512.png',
                  sizes: '512x512',
                  type: 'image/png',
                },
              ],
            },
            workbox: {
              cleanupOutdatedCaches: true,
              clientsClaim: true,
              skipWaiting: true,
            },
          }),
        ]),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      ...(!hasJooxCrypto
        ? {
            '@unlock-music/joox-crypto': fileURLToPath(new URL('./src/decrypt/joox_unavailable.ts', import.meta.url)),
          }
        : {}),
    },
  },
  worker: {
    format: 'es',
  },
  build: {
    sourcemap: false,
  },
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/__test__/setup.ts'],
  },
}));
