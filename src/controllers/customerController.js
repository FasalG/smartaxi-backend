import Customer from '../models/Customer.js';

// @desc    Get all customers for a tenant
// @route   GET /api/customers
// @access  Private
export const getCustomers = async (req, res) => {
    try {
        const tenantId = req.user.role === 'admin' ? req.user._id : req.user.tenantId;

        if (!tenantId && req.user.role === 'driver') {
            return res.json({ success: true, data: [] });
        }

        const query = tenantId ? { tenantId } : {};
        const customers = await Customer.find(query);
        res.json({ success: true, data: customers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Create a new customer
// @route   POST /api/customers
// @access  Private
export const createCustomer = async (req, res) => {
    try {
        const { name, phone, email, address } = req.body;
        const tenantId = req.user.role === 'admin' ? req.user._id : req.user.tenantId;

        const customer = await Customer.create({
            name,
            phone,
            email,
            address,
            tenantId
        });

        res.status(201).json({ success: true, data: customer, message: 'Customer created successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Private/Admin
export const updateCustomer = async (req, res) => {
    try {
        const tenantId = req.user.role === 'admin' ? req.user._id : req.user.tenantId;
        const customer = await Customer.findOneAndUpdate(
            { _id: req.params.id, tenantId },
            req.body,
            { new: true }
        );

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        res.json({ success: true, data: customer, message: 'Customer updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private/Admin
export const deleteCustomer = async (req, res) => {
    try {
        const tenantId = req.user.role === 'admin' ? req.user._id : req.user.tenantId;
        const customer = await Customer.findOneAndDelete({ _id: req.params.id, tenantId });

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        res.json({ success: true, message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
