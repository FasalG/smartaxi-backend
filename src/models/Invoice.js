import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    invoice_number: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    base_amount: { type: Number, required: true },
    gst_percentage: { type: Number, default: 18 },
    gst_amount: { type: Number, required: true },
    total_amount: { type: Number, required: true },
    paid_amount: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'sent', 'paid', 'overdue'], default: 'draft' },
    due_date: { type: Date, required: true },
}, { timestamps: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
