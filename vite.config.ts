import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Honour the port the harness assigns, so the server can share a machine
  // with other dev servers instead of fighting over 5173.
  server: {
    port: Number(process.env.PORT) || 5173,
  },
  base: command === 'build' ? '/checkout-playground/' : '/',
  build: {
    outDir: 'dist',
  },
}))
