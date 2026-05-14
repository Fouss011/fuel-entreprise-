import express from 'express'

import {
  getApprovedVouchers,
  deliverFuel,
  searchVoucherByCode
} from '../controllers/fuelDeliveries.controller.js'

import { authMiddleware } from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.get(
  '/approved-vouchers',
  authMiddleware,
  getApprovedVouchers
)

router.get(
  '/search',
  authMiddleware,
  searchVoucherByCode
)

router.post(
  '/deliver',
  authMiddleware,
  requireRole(
    'super_admin',
    'direction',
    'pompiste'
  ),
  deliverFuel
)

export default router