import express from 'express';
import { login, setupUser, getAdmins, getDrivers } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/setup', protect, authorize('superadmin', 'admin'), setupUser);
router.get('/admins', protect, authorize('superadmin'), getAdmins);
router.get('/drivers', protect, authorize('superadmin', 'admin'), getDrivers);

export default router;
