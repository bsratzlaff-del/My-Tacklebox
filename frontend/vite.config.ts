import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173, // Your frontend UI will live here
  },
  build: {
    sourcemap: 'inline' // Uses secure base64 string maps instead of eval()
  },
  css: {
    devSourcemap: false // Disables eval-based source maps for styling sheets
  }
});
