import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // When deploying to GitHub Pages for a project site, set the `base` to
  // the repository name (so assets are loaded from /DRS-Wheel-Of-Names/).
  // Change or remove this if you deploy to a custom domain or a user/organization site.
  base: '/DRS-Wheel-Of-Names/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
