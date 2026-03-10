import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    // The admin's ID this vehicle belongs to
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    serviceDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    type: {
        type: String,
        enum: ['routine', 'repair', 'inspection', 'other'],
        default: 'routine'
    },
    status: {
        type: String,
        enum: ['scheduled', 'in-progress', 'completed'],
        default: 'completed'
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);
export default Maintenance;
