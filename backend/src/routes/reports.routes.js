import express from 'express'

import { getDeliveriesReport } from '../controllers/reports.controller.js'

import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get(
  '/deliveries',
  authMiddleware,
  getDeliveriesReport
)

export default router