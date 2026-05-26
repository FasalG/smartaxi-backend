import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    expenseNumber: {
        type: String,
        required: true,
        unique: true
    },
    expense_number: {
        type: String
    },
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
    expenseType: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    remarks: {
        type: String
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    imageUrl: {
        type: String
    }
}, {
    timestamps: true
});

expenseSchema.pre('validate', async function (next) {
    if (!this.expenseNumber) {
        try {
            let uniqueCode = '';
            let isUnique = false;
            
            while (!isUnique) {
                const randomNum = Math.floor(10000 + Math.random() * 90000);
                uniqueCode = `EXP-${randomNum}`;
                
                // Query database to guarantee it is truly non-repeatable (unique)
                const existing = await mongoose.model('Expense').findOne({ expenseNumber: uniqueCode });
                if (!existing) {
                    isUnique = true;
                }
            }
            
            this.expenseNumber = uniqueCode;
            this.expense_number = uniqueCode;
        } catch (err) {
            return next(err);
        }
    }
    next();
});

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
