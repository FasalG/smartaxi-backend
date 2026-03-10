import express from 'express';
import { getTrips, getDriverTrips, createTrip, updateTripStatus } from '../controllers/tripController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getTrips)
    .post(protect, createTrip);

router.get('/driver', protect, getDriverTrips);

router.route('/:id')
    .put(protect, updateTripStatus);

export default router;
