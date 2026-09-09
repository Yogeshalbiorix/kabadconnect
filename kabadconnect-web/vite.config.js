import react from '@vitejs/plugin-react'
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

        const url = new URL(req.url, 'http://localhost')
        const endpoint = url.pathname.replace(/^\/api\/?/, '').split('?')[0]

        if (!endpoint) {
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
          const apiFile = path.resolve(__dirname, 'api', `${endpoint}.js`)
          const fileUrl = `${pathToFileURL(apiFile).href}?t=${Date.now()}`
          const module = await import(fileUrl)
          const handler = module.default

          if (typeof handler !== 'function') {
            return next()
          }

          // Parse query parameters
          req.query = Object.fromEntries(url.searchParams.entries())

          // Parse body for mutations
          if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
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
  plugins: [react(), vercelServerlessDevPlugin()],
})

