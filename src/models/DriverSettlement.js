import mongoose from 'mongoose';

const driverSettlementSchema = new mongoose.Schema({
    settlementNumber: {
        type: String,
        required: true,
        unique: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 1
    },
    paymentMethod: {
        type: String,
        enum: ['gpay', 'cash', 'phonepe', 'bank_transfer', 'other'],
        required: true
    },
    paymentDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    referenceId: {
        type: String, // Transaction ID (not mandatory)
        trim: true
    },
    receiptUrl: {
        type: String // URL of receipt uploaded to Cloudinary
    },
    notes: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    trips: [{
        tripId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Trip',
            required: true
        },
        allocatedAmount: {
            type: Number,
            required: true
        }
    }],
    adminNotes: {
        type: String
    },
    approvedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Auto-generate unique settlement voucher code SET-XXXXX
driverSettlementSchema.pre('validate', async function (next) {
    if (!this.settlementNumber) {
        try {
            let uniqueCode = '';
            let isUnique = false;
            while (!isUnique) {
                const randomNum = Math.floor(10000 + Math.random() * 90000);
                uniqueCode = `SET-${randomNum}`;
                const existing = await mongoose.model('DriverSettlement').findOne({ settlementNumber: uniqueCode });
                if (!existing) {
                    isUnique = true;
                }
            }
            this.settlementNumber = uniqueCode;
        } catch (err) {
            return next(err);
        }
    }
    next();
});

const DriverSettlement = mongoose.model('DriverSettlement', driverSettlementSchema);
export default DriverSettlement;
