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
    customerName: {
        type: String,
        required: [true, 'Customer name is required']
    },
    visitingPlaces: {
        type: String,
        required: [true, 'Visiting places are required']
    },
    tripType: {
        type: String,
        enum: ['Cash', 'Credit'],
        default: 'Cash'
    },
    acType: {
        type: String,
        enum: ['A/C', 'Non A/C'],
        default: 'A/C'
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
    minimumCharges: {
        type: Number,
        default: 0
    },
    extraKmCharges: {
        type: Number,
        default: 0
    },
    extraHoursCharges: {
        type: Number,
        default: 0
    },
    tollParking: {
        type: Number,
        default: 0
    },
    permitTax: {
        type: Number,
        default: 0
    },
    nightCharges: {
        type: Number,
        default: 0
    },
    fuelCharges: {
        type: Number,
        default: 0
    },
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
    paidAmount: {
        type: Number,
        default: 0
    },
    guestComments: {
        type: String
    },
    status: {
        type: String,
        enum: ['in-progress', 'completed', 'cancelled'],
        default: 'in-progress'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;
