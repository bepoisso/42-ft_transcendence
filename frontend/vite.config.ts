import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    host: 'localhost', // Force l'utilisation de localhost au lieu de 127.0.0.1
    port: 5173,
  proxy: {
    '/back': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
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
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
    '/auth': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
      configure: (proxy, _options) => {
        proxy.on('error', (err, _req, _res) => {
          console.log('proxy error', err);
        });
      },
    },
  },
}
});
