import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// BASE_PATH=/ once valeobody.com is attached; default = GitHub Pages project path.
const base = process.env.BASE_PATH ?? '/valeo-site/';

export default defineConfig({
  base,
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        shop: resolve(__dirname, 'shop/index.html'),
        checkout: resolve(__dirname, 'checkout/index.html'),
      },
    },
  },
});
