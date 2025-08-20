import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set base for GitHub Pages at https://ishowprogram.github.io/Qr-Code-Generator/
  base: '/Qr-Code-Generator/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
