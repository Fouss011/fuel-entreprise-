import express from 'express'

import { getVehicleHistory } from '../controllers/vehicleHistory.controller.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', authMiddleware, getVehicleHistory)

export default router