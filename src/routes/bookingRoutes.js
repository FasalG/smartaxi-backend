import express from 'express';
import {
    getBookings, createBooking, updateBooking, deleteBooking, generateInvoice, generateReceipt
} from '../controllers/bookingController.js';

const router = express.Router();

router.route('/')
    .get(getBookings)
    .post(createBooking);

router.route('/:id')
    .put(updateBooking)
    .delete(deleteBooking);

router.route('/:id/invoice')
    .get(generateInvoice);

router.route('/:id/receipt')
    .get(generateReceipt);

export default router;
