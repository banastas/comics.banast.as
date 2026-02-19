import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
    },
    // Optimize chunk size
    rollupOptions: {
      output: {
        manualChunks: {
          // React and React DOM
          'react-vendor': ['react', 'react-dom', 'react-helmet-async'],
          // Lucide icons
          'icons': ['lucide-react'],
          // Comic data and utilities
          'data': ['./src/data/comics.json'],
          // Hooks and utilities
          'utils': [
            './src/utils/formatting.ts',
            './src/utils/stats.ts',
            './src/utils/sorting.ts',
            './src/utils/performance.ts',
            './src/stores/comicStore.ts'
          ],
          // Core components
          'components': [
            './src/components/Dashboard.tsx',
            './src/components/ComicCard.tsx',
            './src/components/ComicListView.tsx',
            './src/components/FilterControls.tsx',
            './src/components/TouchTarget.tsx',
            './src/components/FluidTypography.tsx',
            './src/components/LoadingSkeleton.tsx',
            './src/components/ResponsiveImage.tsx',
            './src/components/SEO.tsx'
          ]
        },
        // Optimize asset naming
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      }
    },
    chunkSizeWarningLimit: 600,
    // Enable source maps for debugging (can be disabled in production)
    sourcemap: false,
    // Set target for modern browsers
    target: 'es2015',
    // Enable CSS code splitting
    cssCodeSplit: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react', 'react-dom', 'react-helmet-async', 'zustand', 'zod'],
  },
  // Enable compression
  server: {
    headers: {
      'Cache-Control': 'public, max-age=31536000',
    },
  },
});
