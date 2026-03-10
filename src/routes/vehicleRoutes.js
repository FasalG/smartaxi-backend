import express from 'express';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../controllers/vehicleController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getVehicles)
    .post(protect, createVehicle);

router.route('/:id')
    .put(protect, updateVehicle)
    .delete(protect, deleteVehicle);

export default router;
