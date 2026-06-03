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
  requireRole('super_admin', 'direction', 'chef_division', 'formateur'),
  createFuelVoucher
)

router.patch(
  '/:id/approve',
  authMiddleware,
  requireRole('super_admin', 'direction', 'chef_division', 'formateur'),
  approveFuelVoucher
)

router.patch(
  '/:id/reject',
  authMiddleware,
  requireRole('super_admin', 'direction', 'chef_division', 'formateur'),
  rejectFuelVoucher
)

router.delete(
  '/:id',
  authMiddleware,
  requireRole('super_admin', 'direction', 'chef_division', 'formateur'),
  deleteFuelVoucher
)

export default router