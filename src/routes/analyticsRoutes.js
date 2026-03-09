import express from 'express';
import { getStats, getRecentActivities } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/stats', getStats);
router.get('/recent', getRecentActivities);

export default router;
