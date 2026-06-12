import express from 'express'

import {
  getUsers,
  createUser,
  deleteUser,
  getArchivedUsers,
restoreUser,
deleteArchivedUserPermanently
} from '../controllers/users.controller.js'

import { authMiddleware } from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.get('/', authMiddleware, getUsers)

router.post(
  '/',
  authMiddleware,
  requireRole('super_admin', 'direction', 'formateur'),
  createUser
)

router.get(
  '/archives',
  authMiddleware,
  requireRole('super_admin', 'direction', 'formateur'),
  getArchivedUsers
)

router.patch(
  '/:id/restore',
  authMiddleware,
  requireRole('super_admin', 'direction', 'formateur'),
  restoreUser
)

router.delete(
  '/:id/permanent',
  authMiddleware,
  requireRole('super_admin', 'direction', 'formateur'),
  deleteArchivedUserPermanently
)

router.delete(
  '/:id',
  authMiddleware,
  requireRole('super_admin', 'direction', 'formateur'),
  deleteUser
)

export default router