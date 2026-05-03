import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/Divinity-RPS/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: true,
  },
});
