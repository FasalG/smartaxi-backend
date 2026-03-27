import express from 'express';
import {
    login,
    setupUser,
    getAdmins,
    getDrivers,
    updateUser,
    deleteUser,
    getMe,
    requestEmailOTP as requestDriverVerification,
    verifyEmailOTP as verifyDriverOTP
} from '../controllers/authController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/request-verification', protect, authorize('superadmin', 'admin'), requestDriverVerification);
router.post('/verify-otp', protect, authorize('superadmin', 'admin'), verifyDriverOTP);
router.get('/me', protect, getMe);
router.post('/setup', protect, authorize('superadmin', 'admin'), setupUser);

router.get('/admins', protect, authorize('superadmin'), getAdmins);
router.get('/drivers', protect, authorize('superadmin', 'admin'), getDrivers);

router.route('/:id')
    .put(protect, updateUser)
    .delete(protect, deleteUser);

export default router;
