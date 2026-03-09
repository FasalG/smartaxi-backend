import express from 'express';
import { getBankDetails, createBankDetail, updateBankDetail, deleteBankDetail } from '../controllers/bankDetailController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getBankDetails)
    .post(createBankDetail);

router.route('/:id')
    .put(updateBankDetail)
    .delete(deleteBankDetail);

export default router;
