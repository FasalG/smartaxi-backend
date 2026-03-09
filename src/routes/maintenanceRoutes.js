import express from 'express';
import {
    getMaintenanceRecords, createMaintenanceRecord, updateMaintenanceRecord, deleteMaintenanceRecord
} from '../controllers/maintenanceController.js';

const router = express.Router();

router.route('/')
    .get(getMaintenanceRecords)
    .post(createMaintenanceRecord);

router.route('/:id')
    .put(updateMaintenanceRecord)
    .delete(deleteMaintenanceRecord);

export default router;
