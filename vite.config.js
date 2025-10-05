import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  base: '/memory-game/',   // <- EXACT repo name, including the slashes
  plugins: [react()],
})

