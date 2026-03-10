import Vehicle from '../models/Vehicle.js';

// @desc    Get all vehicles for a tenant
// @route   GET /api/vehicles
// @access  Private/Admin
export const getVehicles = async (req, res) => {
    try {
        const tenantId = req.user.role === 'admin' ? req.user._id : req.user.tenantId;

        // If it's a driver and tenantId is missing, they might be unassigned
        if (!tenantId && req.user.role === 'driver') {
            return res.json({ success: true, data: [] });
        }

        const query = tenantId ? { tenantId } : {};
        const vehicles = await Vehicle.find(query);
        res.json({ success: true, data: vehicles });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Create a new vehicle
// @route   POST /api/vehicles
// @access  Private/Admin
export const createVehicle = async (req, res) => {
    try {
        const { make, model, year, licensePlate, color, status } = req.body;

        const vehicleExists = await Vehicle.findOne({ licensePlate });
        if (vehicleExists) {
            return res.status(400).json({ success: false, message: 'Vehicle with this license plate already exists' });
        }

        const vehicle = await Vehicle.create({
            make,
            model,
            year,
            licensePlate,
            color,
            status,
            tenantId: req.user._id
        });

        res.status(201).json({ success: true, data: vehicle, message: 'Vehicle created successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Private/Admin
export const updateVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findOneAndUpdate(
            { _id: req.params.id, tenantId: req.user._id },
            req.body,
            { new: true }
        );

        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        res.json({ success: true, data: vehicle, message: 'Vehicle updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private/Admin
export const deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findOneAndDelete({ _id: req.params.id, tenantId: req.user._id });

        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        res.json({ success: true, message: 'Vehicle deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
