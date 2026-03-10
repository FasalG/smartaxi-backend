import Trip from '../models/Trip.js';

// @desc    Get all trips for a tenant (Admin view)
// @route   GET /api/trips
// @access  Private/Admin
export const getTrips = async (req, res) => {
    try {
        const trips = await Trip.find({ tenantId: req.user._id })
            .populate('driverId', 'name email')
            .populate('vehicleId', 'licensePlate make model');
        res.json({ success: true, data: trips });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get trips for a specific driver
// @route   GET /api/trips/driver
// @access  Private/Driver
export const getDriverTrips = async (req, res) => {
    try {
        const trips = await Trip.find({ driverId: req.user._id })
            .populate('vehicleId', 'licensePlate make model');
        res.json({ success: true, data: trips });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Private/Admin
export const createTrip = async (req, res) => {
    try {
        const { driverId, vehicleId, startLocation, startTime, notes } = req.body;

        const trip = await Trip.create({
            driverId,
            vehicleId,
            startLocation,
            startTime,
            notes,
            tenantId: req.user._id,
            status: 'in-progress'
        });

        res.status(201).json({ success: true, data: trip, message: 'Trip started successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Update trip status (Complete/Cancel)
// @route   PUT /api/trips/:id
// @access  Private/Admin/Driver
export const updateTripStatus = async (req, res) => {
    try {
        const { status, endLocation, endTime, distance, fareAmount, paymentStatus } = req.body;

        // Find trip by ID and ensure it belongs to the tenant OR the driver
        const trip = await Trip.findOne({
            _id: req.params.id,
            $or: [{ tenantId: req.user._id }, { driverId: req.user._id }]
        });

        if (!trip) {
            return res.status(404).json({ success: false, message: 'Trip not found' });
        }

        if (status) trip.status = status;
        if (endLocation) trip.endLocation = endLocation;
        if (endTime) trip.endTime = endTime;
        if (distance) trip.distance = distance;
        if (fareAmount) trip.fareAmount = fareAmount;
        if (paymentStatus) trip.paymentStatus = paymentStatus;

        await trip.save();

        res.json({ success: true, data: trip, message: 'Trip updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
