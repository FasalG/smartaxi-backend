import express from 'express';
import { getMaintenance, createMaintenanceRecord, updateMaintenanceStatus, getVehicleMaintenance } from '../controllers/maintenanceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getMaintenance)
    .post(protect, createMaintenanceRecord);

router.route('/:id')
    .put(protect, updateMaintenanceStatus);

router.get('/vehicle/:id', protect, getVehicleMaintenance);

export default router;
