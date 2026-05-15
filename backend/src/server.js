import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import divisionsRoutes from './routes/divisions.routes.js'
import vehiclesRoutes from './routes/vehicles.routes.js'
import usersRoutes from './routes/users.routes.js'
import fuelVouchersRoutes from './routes/fuelVouchers.routes.js'
import fuelDeliveriesRoutes from './routes/fuelDeliveries.routes.js'
import reportsRoutes from './routes/reports.routes.js'
import analyticsRoutes from './routes/analytics.routes.js'
import monthlyClosingRoutes from './routes/monthlyClosing.routes.js'
import vehicleHistoryRoutes from './routes/vehicleHistory.routes.js'
import structuresRoutes from './routes/structures.routes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}))

app.use(express.json({ limit: '2mb' }))
app.use(morgan('dev'))

app.get('/', (req, res) => {
  res.json({
    name: 'Fuel Enterprise API',
    status: 'running',
    version: '1.0.0'
  })
})

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString()
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/divisions', divisionsRoutes)
app.use('/api/vehicles', vehiclesRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/fuel-vouchers', fuelVouchersRoutes)
app.use('/api/fuel-deliveries', fuelDeliveriesRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/monthly-closing', monthlyClosingRoutes)
app.use('/api/vehicle-history', vehicleHistoryRoutes)
app.use('/api/structures', structuresRoutes)

app.use((req, res) => {
  res.status(404).json({ error: 'Route introuvable' })
})

app.use((err, req, res, next) => {
  console.error('SERVER_ERROR =>', err)
  res.status(500).json({ error: 'Erreur serveur' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`)
})