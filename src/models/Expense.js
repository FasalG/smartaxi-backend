import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expense_number: { type: String, required: true, unique: true },
    category: {
        type: String,
        enum: ['maintenance', 'fuel', 'insurance', 'utilities', 'salary', 'rent', 'marketing', 'other'],
        required: true
    },
    description: { type: String, required: true },
    vendor: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'approved'], default: 'pending' },
    expense_date: { type: Date, required: true },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

expenseSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
