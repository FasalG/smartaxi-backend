import BankDetail from '../models/BankDetail.js';

// @desc    Get all bank details
// @route   GET /api/bank-details
export const getBankDetails = async (req, res) => {
    try {
        const bankDetails = await BankDetail.find({ user: req.user._id });
        res.status(200).json({ success: true, data: bankDetails, message: null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a bank detail
// @route   POST /api/bank-details
export const createBankDetail = async (req, res) => {
    try {
        const newBankDetail = new BankDetail({
            ...req.body,
            user: req.user._id
        });
        const bankDetail = await newBankDetail.save();
        res.status(201).json({ success: true, data: bankDetail, message: 'Bank details saved successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update a bank detail
// @route   PUT /api/bank-details/:id
export const updateBankDetail = async (req, res) => {
    try {
        const bankDetail = await BankDetail.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );
        if (!bankDetail) return res.status(404).json({ success: false, message: 'Bank detail not found or unauthorized' });
        res.status(200).json({ success: true, data: bankDetail, message: 'Bank details updated successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete a bank detail
// @route   DELETE /api/bank-details/:id
export const deleteBankDetail = async (req, res) => {
    try {
        const bankDetail = await BankDetail.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!bankDetail) return res.status(404).json({ success: false, message: 'Bank detail not found or unauthorized' });
        res.status(200).json({ success: true, data: bankDetail, message: 'Bank details deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
