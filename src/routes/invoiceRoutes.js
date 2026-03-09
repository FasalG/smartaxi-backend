import express from 'express';
import {
    getInvoices, createInvoice, registerPayment
} from '../controllers/invoiceController.js';

const router = express.Router();

router.route('/')
    .get(getInvoices)
    .post(createInvoice);

router.post('/:id/payments', registerPayment);

export default router;
