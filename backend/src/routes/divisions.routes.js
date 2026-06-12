import express from 'express'

import {
  getDivisions,
  createDivision,
  deleteDivision,
  getArchivedDivisions,
restoreDivision,
deleteArchivedDivisionPermanently
} from '../controllers/divisions.controller.js'

import { authMiddleware } from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.get('/', authMiddleware, getDivisions)

router.post(
  '/',
  authMiddleware,
  requireRole('super_admin', 'direction', 'formateur'),
  createDivision
)

router.delete(
  '/:id',
  authMiddleware,
  requireRole('super_admin', 'direction', 'formateur'),
  deleteDivision
)
router.get(
  '/archives',
  authMiddleware,
  requireRole('super_admin', 'direction', 'formateur'),
  getArchivedDivisions
)

router.patch(
  '/:id/restore',
  authMiddleware,
  requireRole('super_admin', 'direction', 'formateur'),
  restoreDivision
)

router.delete(
  '/:id/permanent',
  authMiddleware,
  requireRole('super_admin', 'direction', 'formateur'),
  deleteArchivedDivisionPermanently
)

export default router