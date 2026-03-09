import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    booking_number: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    items: [{
        item: { type: mongoose.Schema.Types.ObjectId, ref: 'RentalItem', required: true },
        quantity: { type: Number, default: 1 },
        rate: { type: Number, required: true }
    }],
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    duration_days: { type: Number, required: true },
    amount: { type: Number, required: true },
    initial_payment_received: { type: Number, default: 0 },
    payment_method: { type: String, enum: ['cash', 'bank', 'none'], default: 'none' },
    bank_detail: { type: mongoose.Schema.Types.ObjectId, ref: 'BankDetail' },
    status: { type: String, enum: ['pending', 'active', 'confirmed', 'cancelled', 'closed'], default: 'pending' },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

bookingSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
