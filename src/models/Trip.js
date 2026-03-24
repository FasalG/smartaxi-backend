import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    // The admin's ID this driver & vehicle belong to
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startTime: {
        type: Date,
        default: Date.now,
        required: true
    },
    endTime: {
        type: Date
    },
    startLocation: {
        type: String,
        required: [true, 'Start location is required']
    },
    endLocation: {
        type: String
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    customerName: {
        type: String, // Kept for backward compatibility or display
        required: [true, 'Customer name is required']
    },

    tripType: {
        type: String,
        enum: ['Cash', 'Credit'],
        default: 'Cash'
    },

    startOdometer: {
        type: Number,
        required: [true, 'Starting odometer reading is required']
    },
    endOdometer: {
        type: Number
    },
    totalKm: {
        type: Number,
        default: 0
    },
    totalDays: {
        type: Number,
        default: 0
    },
    totalHours: {
        type: Number,
        default: 0
    },
    totalHours: {
        type: Number,
        default: 0
    },
    tollParking: {
        type: Number,
        default: 0
    },
    fuelCharges: {
        type: Number,
        default: 0
    },
    driverBata: {
        type: Number,
        default: 0
    },
    otherExpenses: {
        type: Number,
        default: 0
    },
    otherExpensesList: [{
        name: String,
        amount: Number
    }],
    advanceAmount: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    balanceAmount: {
        type: Number,
        default: 0
    },
    driverSettlementAmount: {
        type: Number,
        default: 0 // +ve means driver owes admin, -ve means admin owes driver
    },
    driverEarnings: {
        type: Number,
        default: 0
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    guestComments: {
        type: String
    },
    status: {
        type: String,
        enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
        default: 'in-progress'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    },
    driverPaymentStatus: {
        type: String,
        enum: ['pending', 'submitted', 'confirmed'],
        default: 'pending'
    },
    driverSettlementMethod: {
        type: String,
        enum: ['cash', 'balance', 'none'],
        default: 'none'
    },
    driverPaymentSubmittedAt: {
        type: Date
    },
    adminConfirmedAt: {
        type: Date
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;
