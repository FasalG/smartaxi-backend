import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['bank', 'cash', 'upi'], required: true },
    transaction_id: { type: String, default: '' },
    payment_date: { type: Date, default: Date.now },
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
