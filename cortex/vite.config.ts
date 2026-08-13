import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { apiServer } from './src/server/vite-plugin.ts'
import path from 'path'

export default defineConfig({
  plugins: [apiServer(), tailwindcss(), svelte()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'melanin': path.resolve(__dirname, './src/lib/melanin-ui'),
      'mimicortex': path.resolve(__dirname, "./src/lib/mimicortex-sdk")
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        ...Object.fromEntries(
          (await import('glob')).sync('./src/apps/**/*.svelte').map(file => [
            file.replace('./src/', '').replace('.svelte', ''),
            file
          ])
        )
      }
    }
  }
})