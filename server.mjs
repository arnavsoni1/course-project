import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { apiHandler } from './api.mjs'

const port = Number(process.env.PORT || 3000)
const dist = join(process.cwd(), 'dist')
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8', '.ico': 'image/x-icon' }

createServer(async (req, res) => {
  if (req.url.startsWith('/api/')) return apiHandler(req, res)
  const requested = normalize(req.url.split('?')[0]).replace(/^([/\\])+/, '')
  if (requested.startsWith('..')) {
    res.writeHead(403, { 'Content-Type': 'text/plain' })
    return res.end('Forbidden')
  }
  const candidate = join(dist, requested || 'index.html')
  const file = existsSync(candidate) && statSync(candidate).isFile() ? candidate : join(dist, 'index.html')
  if (!existsSync(file)) {
    res.writeHead(503, { 'Content-Type': 'text/plain' })
    return res.end('Build the frontend first with npm run build.')
  }
  res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' })
  createReadStream(file).pipe(res)
}).listen(port, () => console.log(`Codegrid is listening on http://localhost:${port}`))
