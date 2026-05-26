import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getPendingTrips,
    createSettlement,
    getDriverSettlements,
    getAdminSettlements,
    approveSettlement,
    rejectSettlement
} from '../controllers/settlementController.js';

const router = express.Router();

router.get('/pending-trips', protect, getPendingTrips);
router.route('/')
    .get(protect, getDriverSettlements)
    .post(protect, createSettlement);

router.get('/admin', protect, getAdminSettlements);
router.put('/:id/approve', protect, approveSettlement);
router.put('/:id/reject', protect, rejectSettlement);

export default router;
