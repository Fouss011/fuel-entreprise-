import express from 'express'

import {
  getApprovedVouchers,
  deliverFuel,
  searchVoucherByCode,
  updateFuelDelivery,
  archiveFuelDelivery,
  restoreFuelDelivery,
  getArchivedFuelDeliveries
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

router.get(
  '/archives',
  authMiddleware,
  requireRole(
    'super_admin',
    'direction',
    'formateur'
  ),
  getArchivedFuelDeliveries
)

router.post(
  '/deliver',
  authMiddleware,
  requireRole(
    'super_admin',
    'direction',
    'pompiste',
    'formateur'
  ),
  deliverFuel
)

router.patch(
  '/:id',
  authMiddleware,
  requireRole(
    'super_admin',
    'direction',
    'formateur'
  ),
  updateFuelDelivery
)

router.patch(
  '/:id/archive',
  authMiddleware,
  requireRole(
    'super_admin',
    'direction',
    'formateur'
  ),
  archiveFuelDelivery
)

router.patch(
  '/:id/restore',
  authMiddleware,
  requireRole(
    'super_admin',
    'direction',
    'formateur'
  ),
  restoreFuelDelivery
)

export default router