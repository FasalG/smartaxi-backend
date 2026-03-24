import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Customer name is required']
    },
    phone: {
        type: String
    },
    email: {
        type: String
    },
    address: {
        type: String
    },
    isEligibleForCredit: {
        type: Boolean,
        default: false
    },
    creditPeriodDays: {
        type: Number,
        default: 0
    },
    // The admin's ID this customer belongs to
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
