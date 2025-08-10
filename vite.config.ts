import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React and React DOM
          'react-vendor': ['react', 'react-dom'],
          // Lucide icons
          'icons': ['lucide-react'],
          // Comic data and utilities
          'data': ['./src/data/comics.json'],
          // Hooks and utilities
          'utils': [
            './src/hooks/useComics.ts',
            './src/utils/performance.ts'
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
            './src/components/ResponsiveImage.tsx'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 600
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
