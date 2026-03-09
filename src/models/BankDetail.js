import mongoose from 'mongoose';

const bankDetailSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    account_holder: { type: String, required: true },
    bank_name: { type: String, required: true },
    account_number: { type: String, required: true },
    ifsc_code: { type: String, required: true },
    is_default: { type: Boolean, default: false }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

bankDetailSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

const BankDetail = mongoose.model('BankDetail', bankDetailSchema);
export default BankDetail;
