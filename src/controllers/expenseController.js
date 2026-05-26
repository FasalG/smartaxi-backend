import Expense from '../models/Expense.js';
import User from '../models/User.js';
import { v2 as cloudinary } from 'cloudinary';

// Configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// @desc    Get all expenses
// @route   GET /smart/expenses
// @access  Private
export const getExpenses = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'driver') {
            query = { driverId: req.user._id };
        } else {
            const tenantId = req.user.role === 'admin' ? req.user._id : req.user.tenantId;
            query = { tenantId };
        }

        const expenses = await Expense.find(query)
            .populate('vehicleId', 'licensePlate make model')
            .populate('driverId', 'name email')
            .sort({ date: -1 });

        res.json({ success: true, data: expenses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Create a new expense record (Driver logs it)
// @route   POST /smart/expenses
// @access  Private
export const createExpense = async (req, res) => {
    try {
        const { vehicleId, expenseType, amount, date, remarks, imageUrl } = req.body;

        const tenantId = req.user.role === 'admin' ? req.user._id : req.user.tenantId;

        if (!tenantId) {
            return res.status(400).json({ success: false, message: 'Tenant association not found for user' });
        }

        let uploadedUrl = '';
        if (imageUrl && imageUrl.startsWith('data:image/')) {
            const uploadResult = await cloudinary.uploader.upload(imageUrl, {
                folder: 'smarttaxi',
                resource_type: 'auto'
            });
            uploadedUrl = uploadResult.secure_url;
        } else if (imageUrl) {
            uploadedUrl = imageUrl;
        }

        const expense = await Expense.create({
            driverId: req.user._id,
            vehicleId,
            expenseType,
            amount,
            date: date || new Date(),
            remarks,
            tenantId,
            imageUrl: uploadedUrl
        });

        res.status(201).json({ success: true, data: expense, message: 'Expense logged successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get expense types configured by Admin
// @route   GET /smart/expenses/types
// @access  Private
export const getExpenseTypes = async (req, res) => {
    try {
        const tenantId = req.user.role === 'admin' ? req.user._id : req.user.tenantId;
        
        if (!tenantId) {
            return res.json({ success: true, data: ['Fuel', 'Toll', 'Maintenance', 'Parking', 'Cleaning'] });
        }

        const admin = await User.findById(tenantId);
        if (!admin || !admin.expenseTypes || admin.expenseTypes.length === 0) {
            return res.json({ success: true, data: ['Fuel', 'Toll', 'Maintenance', 'Parking', 'Cleaning'] });
        }

        res.json({ success: true, data: admin.expenseTypes });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Add a custom expense type (Admin only)
// @route   POST /smart/expenses/types
// @access  Private/Admin
export const addExpenseType = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only administrators can manage expense categories' });
        }

        const { type } = req.body;
        if (!type || !type.trim()) {
            return res.status(400).json({ success: false, message: 'Expense type label is required' });
        }

        const admin = await User.findById(req.user._id);
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin profile not found' });
        }

        // Initialize if not present
        if (!admin.expenseTypes) {
            admin.expenseTypes = [];
        }

        const trimmedType = type.trim();
        if (admin.expenseTypes.includes(trimmedType)) {
            return res.status(400).json({ success: false, message: 'Expense category already exists' });
        }

        admin.expenseTypes.push(trimmedType);
        await admin.save();

        res.json({ success: true, data: admin.expenseTypes, message: 'Expense category added successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Delete a custom expense type (Admin only)
// @route   DELETE /smart/expenses/types/:type
// @access  Private/Admin
export const deleteExpenseType = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only administrators can manage expense categories' });
        }

        const { type } = req.params;
        if (!type) {
            return res.status(400).json({ success: false, message: 'Expense type is required' });
        }

        const admin = await User.findById(req.user._id);
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin profile not found' });
        }

        admin.expenseTypes = admin.expenseTypes.filter(t => t !== type);
        await admin.save();

        res.json({ success: true, data: admin.expenseTypes, message: 'Expense category deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Update an expense record
// @route   PUT /smart/expenses/:id
// @access  Private
export const updateExpense = async (req, res) => {
    try {
        const { vehicleId, expenseType, amount, date, remarks, imageUrl, status } = req.body;
        
        let query = { _id: req.params.id };
        if (req.user.role === 'driver') {
            query.driverId = req.user._id;
            query.status = 'pending'; // Drivers can only edit their pending expenses!
        } else {
            const tenantId = req.user.role === 'admin' ? req.user._id : req.user.tenantId;
            query.tenantId = tenantId;
        }

        let uploadedUrl = imageUrl;
        if (imageUrl && imageUrl.startsWith('data:image/')) {
            const uploadResult = await cloudinary.uploader.upload(imageUrl, {
                folder: 'smarttaxi',
                resource_type: 'auto'
            });
            uploadedUrl = uploadResult.secure_url;
        }

        const updateData = {};
        if (vehicleId !== undefined) updateData.vehicleId = vehicleId;
        if (expenseType !== undefined) updateData.expenseType = expenseType;
        if (amount !== undefined) updateData.amount = amount;
        if (date !== undefined) updateData.date = date;
        if (remarks !== undefined) updateData.remarks = remarks;
        if (imageUrl !== undefined) updateData.imageUrl = uploadedUrl;
        if (req.user.role === 'admin' && status !== undefined) {
            updateData.status = status;
        }

        const expense = await Expense.findOneAndUpdate(
            query,
            updateData,
            { new: true }
        );

        if (!expense) {
            return res.status(404).json({ success: false, message: 'Expense not found or unauthorized' });
        }

        res.json({ success: true, data: expense, message: 'Expense updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Delete an expense record
// @route   DELETE /smart/expenses/:id
// @access  Private
export const deleteExpense = async (req, res) => {
    try {
        let query = { _id: req.params.id };
        if (req.user.role === 'driver') {
            query.driverId = req.user._id;
            query.status = 'pending'; // Drivers can only delete their pending expenses!
        } else {
            query.tenantId = req.user._id;
        }

        const expense = await Expense.findOneAndDelete(query);

        if (!expense) {
            return res.status(404).json({ success: false, message: 'Expense not found or unauthorized' });
        }

        res.json({ success: true, message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
