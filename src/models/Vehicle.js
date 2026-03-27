import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    licensePlate: { type: String, required: true, unique: true },
    color: { type: String, required: true },
    status: {
        type: String,
        enum: ['active', 'maintenance', 'inactive'],
        default: 'active'
    },
    driverPaymentPercentage: {
        type: Number,
        default: 20
    },
    // Compliance Dates
    registrationDate: { type: Date },
    fitnessExpiry: { type: Date },
    insuranceExpiry: { type: Date },
    taxExpiry: { type: Date },
    permitExpiry: { type: Date },
    puccExpiry: { type: Date },

    // The admin's ID this vehicle belongs to
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
