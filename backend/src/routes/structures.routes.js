import express from 'express'

import {
  getStructures,
  createStructure,
  updateStructure
} from '../controllers/structures.controller.js'

import { authMiddleware } from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.get(
  '/',
  authMiddleware,
  requireRole('super_admin'),
  getStructures
)

router.post(
  '/',
  authMiddleware,
  requireRole('super_admin'),
  createStructure
)

router.patch(
  '/:id',
  authMiddleware,
  requireRole('super_admin'),
  updateStructure
)

export default router