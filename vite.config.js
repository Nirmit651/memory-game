import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/memory-game/',   // <- EXACT repo name, including the slashes
  plugins: [react()],
})

