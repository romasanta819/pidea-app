import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const markdownCharsetPlugin = () => ({
  name: 'markdown-charset',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url?.endsWith('.md')) {
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
      }
      next()
    })
  },
  configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url?.endsWith('.md')) {
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
      }
      next()
    })
  }
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), markdownCharsetPlugin()],
  server: {
    port: 3000,
    host: '127.0.0.1', // Forzar IPv4 para mejor compatibilidad
    open: true, // Abrir automáticamente en el navegador
    strictPort: false, // Si el puerto está ocupado, usar otro
    cors: true // Habilitar CORS si es necesario
  }
})
