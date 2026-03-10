import Maintenance from '../models/Maintenance.js';

// @desc    Get all maintenance records for a tenant
// @route   GET /api/maintenance
// @access  Private/Admin
export const getMaintenance = async (req, res) => {
    try {
        const records = await Maintenance.find({ tenantId: req.user._id })
            .populate('vehicleId', 'licensePlate make model');
        res.json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Log a new maintenance record
// @route   POST /api/maintenance
// @access  Private/Admin
export const createMaintenanceRecord = async (req, res) => {
    try {
        const { vehicleId, description, cost, serviceDate, type, status, notes } = req.body;

        const record = await Maintenance.create({
            vehicleId,
            description,
            cost,
            serviceDate,
            type,
            status,
            notes,
            tenantId: req.user._id
        });

        res.status(201).json({ success: true, data: record, message: 'Maintenance record created successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Update maintenance record status
// @route   PUT /api/maintenance/:id
// @access  Private/Admin
export const updateMaintenanceStatus = async (req, res) => {
    try {
        const { status, notes, cost, description } = req.body;

        const record = await Maintenance.findOneAndUpdate(
            { _id: req.params.id, tenantId: req.user._id },
            { status, notes, cost, description },
            { new: true }
        );

        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        res.json({ success: true, data: record, message: 'Maintenance record updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get maintenance records for a specific vehicle
// @route   GET /api/maintenance/vehicle/:id
// @access  Private/Admin
export const getVehicleMaintenance = async (req, res) => {
    try {
        const records = await Maintenance.find({
            vehicleId: req.params.id,
            tenantId: req.user._id
        });
        res.json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
export const deleteMaintenanceRecord = async (req, res) => {
    try {
        const record = await Maintenance.findOneAndDelete({
            _id: req.params.id,
            tenantId: req.user._id
        });

        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        res.json({ success: true, message: 'Maintenance record deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
