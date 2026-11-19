import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy: durante el desarrollo las peticiones /api se redirigen al backend NestJS (puerto 3000)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
