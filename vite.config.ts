import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Shims the process object to prevent crashes in the browser
    'process.env': {
      API_KEY: JSON.stringify(process.env.API_KEY),
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
    },
    // Direct replacement for the specific variable used in code
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true // Useful for debugging Vercel deployments
  }
});