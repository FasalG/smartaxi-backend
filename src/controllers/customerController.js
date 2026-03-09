import Customer from '../models/Customer.js';

// @desc    Get all customers
// @route   GET /api/customers
export const getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: customers, message: null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a customer
// @route   POST /api/customers
export const createCustomer = async (req, res) => {
    try {
        const newCustomer = new Customer({
            ...req.body,
            user: req.user._id
        });
        const customer = await newCustomer.save();
        res.status(201).json({ success: true, data: customer, message: 'Customer created successfully.' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update a customer
// @route   PUT /api/customers/:id
export const updateCustomer = async (req, res) => {
    try {
        const customer = await Customer.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );
        if (!customer) return res.status(404).json({ success: false, message: 'Customer not found or unauthorized' });
        res.status(200).json({ success: true, data: customer, message: 'Customer updated successfully.' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
export const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!customer) return res.status(404).json({ success: false, message: 'Customer not found or unauthorized' });
        res.status(200).json({ success: true, data: customer, message: 'Customer deleted successfully.' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
