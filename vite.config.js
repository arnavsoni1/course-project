import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { apiHandler } from './api.mjs'

export default defineConfig({
  plugins: [react(), {
    name: 'codegrid-api',
    configureServer(server) {
      server.middlewares.use('/api', (req, res) => {
        req.url = `/api${req.url}`
        return apiHandler(req, res)
      })
    }
  }]
})
