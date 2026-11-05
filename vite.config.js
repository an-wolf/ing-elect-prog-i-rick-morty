import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Rutas relativas: GitHub Pages publica el sitio en una subcarpeta.
  base: './',
  plugins: [react()],
})
