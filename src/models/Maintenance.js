import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'RentalItem', required: true },
    description: { type: String, required: true },
    scheduled_date: { type: Date, required: true },
    completed_date: { type: Date },
    technician: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    cost: { type: Number, required: true },
    status: { type: String, enum: ['scheduled', 'in_progress', 'completed', 'overdue'], default: 'scheduled' },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

maintenanceSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);
export default Maintenance;
