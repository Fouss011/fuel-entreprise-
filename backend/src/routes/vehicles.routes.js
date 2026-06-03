import express from 'express'

import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from '../controllers/vehicles.controller.js'

import { authMiddleware } from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.get('/', authMiddleware, getVehicles)

router.post(
  '/',
  authMiddleware,
  requireRole('super_admin', 'direction', 'formateur'),
  createVehicle
)

router.patch(
  '/:id',
  authMiddleware,
  requireRole('super_admin', 'direction', 'formateur'),
  updateVehicle
)

router.delete(
  '/:id',
  authMiddleware,
  requireRole('super_admin', 'direction', 'formateur'),
  deleteVehicle
)

export default router