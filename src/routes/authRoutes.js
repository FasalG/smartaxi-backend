import express from 'express';
import { login, setupUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/setup', setupUser);

export default router;
