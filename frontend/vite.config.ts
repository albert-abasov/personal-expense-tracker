import { defineConfig, createLogger } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const logger = createLogger()
const customLogger = {
  ...logger,
  error(msg: string, options?: Parameters<typeof logger.error>[1]) {
    // ECONNABORTED on the /ws proxy is a React StrictMode dev artifact:
    // the browser closes the WebSocket during the mount→unmount→remount cycle
    // before Vite finishes relaying the backend's CONNECTED frame. Harmless.
    if (msg.includes('ECONNABORTED')) return
    logger.error(msg, options)
  },
}

// https://vite.dev/config/
export default defineConfig({
  customLogger,
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/oauth2': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
