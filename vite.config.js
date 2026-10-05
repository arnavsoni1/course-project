import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), {
    name: 'codegrid-api',
    async configureServer(server) {
      const { apiHandler } = await import('./api.mjs')
      server.middlewares.use('/api', (req, res) => {
        req.url = `/api${req.url}`
        return apiHandler(req, res)
      })
    }
  }]
})
