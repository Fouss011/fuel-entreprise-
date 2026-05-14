import express from 'express'

import {
  getFuelVouchers,
  createFuelVoucher,
  approveFuelVoucher,
  rejectFuelVoucher,
  deleteFuelVoucher
} from '../controllers/fuelVouchers.controller.js'

import { authMiddleware } from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.get('/', authMiddleware, getFuelVouchers)

router.post(
  '/',
  authMiddleware,
  requireRole('super_admin', 'direction', 'chef_division'),
  createFuelVoucher
)

router.patch(
  '/:id/approve',
  authMiddleware,
  requireRole('super_admin', 'direction', 'chef_division'),
  approveFuelVoucher
)

router.patch(
  '/:id/reject',
  authMiddleware,
  requireRole('super_admin', 'direction', 'chef_division'),
  rejectFuelVoucher
)

router.delete(
  '/:id',
  authMiddleware,
  requireRole('super_admin', 'direction', 'chef_division'),
  deleteFuelVoucher
)

export default router