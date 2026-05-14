import express from 'express'

import { getMonthlyClosing } from '../controllers/monthlyClosing.controller.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.get(
  '/',
  authMiddleware,
  requireRole('super_admin', 'direction'),
  getMonthlyClosing
)

export default router