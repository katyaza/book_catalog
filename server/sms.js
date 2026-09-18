import http from 'node:http'
import https from 'node:https'
import { URL } from 'node:url'

const PORT = 3001
const API_KEY = process.env.SMSPILOT_API_KEY

const server = http.createServer((req, res) => {
  if (req.method !== 'POST' || req.url !== '/api/sms') {
    res.writeHead(404)
    res.end()
    return
  }

  let body = ''

  req.on('data', (chunk) => {
    body += chunk
  })

  req.on('end', () => {
    try {
      const { phone, message } = JSON.parse(body)

      if (!phone || !message) {
        res.writeHead(400, {
          'Content-Type': 'application/json',
        })

        res.end(JSON.stringify({
          success: false,
          message: 'Phone and message are required',
        }))

        return
      }

      const params = new URLSearchParams({
        send: message,
        to: phone,
        apikey: API_KEY,
        format: 'json',
        test: '1',
      })

      const url = new URL(
        `https://smspilot.ru/api.php?${params.toString()}`,
      )

      console.log('SMS:', {
        phone,
        message,
      })

      const request = https.get(url, (response) => {
        let data = ''

        response.on('data', (chunk) => {
          data += chunk
        })

        response.on('end', () => {
          res.writeHead(response.statusCode || 500, {
            'Content-Type': 'application/json',
          })

          res.end(data)
        })
      })

      request.on('error', (error) => {
        res.writeHead(500, {
          'Content-Type': 'application/json',
        })

        res.end(JSON.stringify({
          success: false,
          message: error.message,
        }))
      })
    } catch {
      res.writeHead(400, {
        'Content-Type': 'application/json',
      })

      res.end(JSON.stringify({
        success: false,
        message: 'Invalid request',
      }))
    }
  })
})

server.listen(PORT, () => {
  console.log(`SMS server started on http://localhost:${PORT}`)
})