import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Recharts pulls RTK, and rolldown intermittently fails package export resolution for `immer`.
      immer: resolve(__dirname, 'node_modules/immer/dist/immer.mjs')
    }
  }
})
