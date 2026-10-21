import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

import paymentsRouter from './routes/payments.js'
import webhooksRouter from './routes/webhooks.js'
import receiptsRouter from './routes/receipts.js'
import { startReconciliationJob } from './services/reconciliation.js'

dotenv.config()

// Fail closed by default outside explicit development mode
const isDev = process.env.NODE_ENV === 'development'
if (!isDev) {
  const missing = []
  if (!process.env.LENCO_SECRET_KEY) missing.push('LENCO_SECRET_KEY')
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY')
  if (missing.length > 0) {
    console.error(`FATAL: Missing required environment variables in non-development mode: ${missing.join(', ')}`)
    process.exit(1)
  }
}

const app = express()
const PORT = process.env.PORT || 3001

// Trust upstream proxy (e.g. Railway, Render, Vercel, AWS ALB)
// Ensures express-rate-limit identifies client IP instead of sharing one proxy IP
app.set('trust proxy', 1)

// Security headers
app.use(helmet())

// Origin restrictions
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173']

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`))
    },
    credentials: true
  })
)

// Body parser with raw body buffer for HMAC signature verification
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf
    }
  })
)

// Global API rate limiter (100 requests per 15 minutes)
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
})

// Stricter rate limiter for MoMo payment initiation (5 requests per minute per IP)
const momoLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many payment attempts, please wait a minute.' }
})

// Stricter rate limiter for receipt verification (30 requests per minute per IP)
const verifyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many verification requests, please try again shortly.' }
})

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'PandaStays API Gateway'
  })
})

// Domain Routers
app.use('/api', globalApiLimiter)
app.use('/api/payments/momo', momoLimiter)
app.use('/api/payments', paymentsRouter)
app.use('/api/webhooks', webhooksRouter)
app.use('/api/receipts/verify', verifyLimiter)
app.use('/api/receipts', receiptsRouter)

// Global 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Global Error Handler (never leaks err.message to client)
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`PandaStays Backend Service running on port ${PORT}`)
  // Start background payment reconciliation job (every 30 minutes)
  startReconciliationJob(30 * 60 * 1000)
})

export default app
