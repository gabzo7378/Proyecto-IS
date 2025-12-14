import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Configuración para el servidor de desarrollo
  server: {
    port: 5173,
    host: true
  },
  
  // Configuración para preview (producción local)
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT ? parseInt(process.env.PORT) : 4173,
    strictPort: false
  },
  
  // Configuración de build
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild'
  },
  
  // Resolver alias (opcional pero útil)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})