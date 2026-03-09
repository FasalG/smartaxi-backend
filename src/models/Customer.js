import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customer_code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    company: { type: String, default: '' },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' },
    gst_registered: { type: Boolean, default: false },
    gst_number: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

customerSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
