import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    host: 'localhost',
    port: 5173,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '../backend/certs/server-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '../backend/certs/server-cert.pem')),
    },
  proxy: {
    '/back': {
      target: 'https://localhost:3000',
      changeOrigin: true,
      secure: false, // Accepter les certificats auto-signés
      configure: (proxy, _options) => {
        proxy.on('error', (err, _req, _res) => {
          console.log('proxy error', err);
        });
        proxy.on('proxyReq', (proxyReq, req, _res) => {
          console.log('Sending Request to the Target:', req.method, req.url);
        });
        proxy.on('proxyRes', (proxyRes, req, _res) => {
          console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
        });
      },
      rewrite: (path) => path.replace(/^\/back/, ''),
    },
    '/auth': {
      target: 'https://localhost:3000',
      changeOrigin: true,
      secure: false, // Accepter les certificats auto-signés
      configure: (proxy, _options) => {
        proxy.on('error', (err, _req, _res) => {
          console.log('proxy error', err);
        });
      },
    },
  },
}
});
