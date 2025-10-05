import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // If you're serving the site from a custom domain root (e.g. wheelofnames.driesbielen.be)
  // set the base to '/' so generated asset paths are absolute to the domain root.
  // For GitHub project sites (username.github.io/repo) use '/repo-name/'.
  base: '/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
