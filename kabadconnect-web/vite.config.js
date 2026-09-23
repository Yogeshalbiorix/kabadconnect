import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function vercelServerlessDevPlugin() {
  return {
    name: 'vercel-serverless-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api')) {
          return next()
        }

        // Polyfill Vercel res helper methods immediately
        if (!res.status) {
          res.status = function (code) {
            this.statusCode = code
            return this
          }
        }
        if (!res.json) {
          res.json = function (data) {
            this.setHeader('Content-Type', 'application/json')
            this.end(JSON.stringify(data))
            return this
          }
        }

        try {
          // Unified API router in root /api/index.js
          const apiFile = path.resolve(__dirname, '../api/index.js')
          const fileUrl = `${pathToFileURL(apiFile).href}?t=${Date.now()}`
          const module = await import(fileUrl)
          const handler = module.default

          if (typeof handler !== 'function') {
            return next()
          }

          // Parse query parameters
          const url = new URL(req.url, 'http://localhost')
          req.query = Object.fromEntries(url.searchParams.entries())

          // Parse body for mutations
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
            let body = ''
            req.on('data', (chunk) => {
              body += chunk
            })
            req.on('end', async () => {
              try {
                req.body = body ? JSON.parse(body) : {}
              } catch {
                req.body = {}
              }
              try {
                await handler(req, res)
              } catch (hErr) {
                res.status(500).json({ error: hErr.message })
              }
            })
          } else {
            try {
              await handler(req, res)
            } catch (hErr) {
              res.status(500).json({ error: hErr.message })
            }
          }
        } catch (err) {
          console.error('[Vite Serverless Dev Error]', err.message)
          res.status(500).json({ error: err.message })
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    vercelServerlessDevPlugin()
  ],
  build: {
    chunkSizeWarningLimit: 3000,
  }
})
