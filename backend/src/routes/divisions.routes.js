import express from 'express'

import {
  getDivisions,
  createDivision,
  deleteDivision
} from '../controllers/divisions.controller.js'

import { authMiddleware } from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.get('/', authMiddleware, getDivisions)

router.post(
  '/',
  authMiddleware,
  requireRole('super_admin', 'direction'),
  createDivision
)

router.delete(
  '/:id',
  authMiddleware,
  requireRole('super_admin', 'direction'),
  deleteDivision
)

export default router