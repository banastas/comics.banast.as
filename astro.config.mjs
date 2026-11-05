// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { staticOutput } from './integrations/static-output.mjs';

export default defineConfig({
  site: 'https://comics.banast.as',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [react(), staticOutput()],
  vite: { plugins: [tailwindcss()] },
});
