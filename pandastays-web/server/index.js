import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import paymentsRouter from './routes/payments.js'
import webhooksRouter from './routes/webhooks.js'
import tenantsRouter from './routes/tenants.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Global Middlewares
app.use(cors())
app.use(express.json({
  verify: (req, res, buf) => { req.rawBody = buf }
}))

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'PandaStays API Gateway'
  })
})

// Domain Routers
app.use('/api/payments', paymentsRouter)
app.use('/api/webhooks', webhooksRouter)
app.use('/api/tenants', tenantsRouter)

// Global 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err)
  res.status(500).json({ error: 'Internal server error', message: err.message })
})

app.listen(PORT, () => {
  console.log(`PandaStays Backend Service running on port ${PORT}`)
})

export default app
