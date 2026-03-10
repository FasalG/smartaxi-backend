import express from 'express';
import { getTrips, getDriverTrips, createTrip, updateTripStatus, deleteTrip } from '../controllers/tripController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getTrips)
    .post(protect, createTrip);

router.get('/driver', protect, getDriverTrips);

router.route('/:id')
    .put(protect, updateTripStatus)
    .delete(protect, deleteTrip);

export default router;
