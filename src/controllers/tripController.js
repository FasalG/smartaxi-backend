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
// @access  Private/Admin/Driver
export const createTrip = async (req, res) => {
    try {
        const {
            driverId,
            vehicleId,
            startLocation,
            startTime,
            endTime,
            customerName,
            visitingPlaces,
            tripType,
            acType,
            startOdometer,
            endOdometer,
            totalKm,
            totalAmount,
            balanceAmount,
            notes
        } = req.body;

        const tenantId = req.user.role === 'admin' ? req.user._id : req.user.tenantId;

        const trip = await Trip.create({
            driverId: driverId || req.user._id,
            vehicleId,
            startLocation,
            startTime: startTime || Date.now(),
            endTime,
            customerName,
            visitingPlaces,
            tripType,
            acType,
            startOdometer,
            endOdometer,
            totalKm,
            totalAmount,
            balanceAmount,
            notes,
            tenantId,
            status: 'in-progress'
        });

        const populatedTrip = await Trip.findById(trip._id)
            .populate('driverId', 'name email')
            .populate('vehicleId', 'licensePlate make model');

        res.status(201).json({ success: true, data: populatedTrip, message: 'Trip started successfully' });
    } catch (error) {
        console.error('Create trip error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Update trip status (Complete/Cancel)
// @route   PUT /api/trips/:id
// @access  Private/Admin/Driver
export const updateTripStatus = async (req, res) => {
    try {
        const {
            driverId,
            vehicleId,
            customerName,
            visitingPlaces,
            startLocation,
            status,
            endLocation,
            startTime,
            endTime,
            endOdometer,
            totalKm,
            totalDays,
            totalHours,
            minimumCharges,
            extraKmCharges,
            extraHoursCharges,
            tollParking,
            permitTax,
            nightCharges,
            fuelCharges,
            advanceAmount,
            totalAmount,
            balanceAmount,
            paidAmount,
            guestComments,
            paymentStatus,
            notes
        } = req.body;

        // Find trip by ID and ensure it belongs to the tenant OR the driver
        let trip = await Trip.findOne({
            _id: req.params.id,
            $or: [{ tenantId: req.user._id }, { driverId: req.user._id }]
        });

        if (!trip) {
            return res.status(404).json({ success: false, message: 'Trip not found' });
        }

        if (status) trip.status = status;
        if (driverId) trip.driverId = driverId;
        if (vehicleId) trip.vehicleId = vehicleId;
        if (customerName) trip.customerName = customerName;
        if (visitingPlaces) trip.visitingPlaces = visitingPlaces;
        if (startLocation) trip.startLocation = startLocation;
        if (endLocation) trip.endLocation = endLocation;
        if (startTime) trip.startTime = startTime;
        if (endTime) trip.endTime = endTime;
        if (endOdometer) trip.endOdometer = endOdometer;
        if (totalKm !== undefined) trip.totalKm = totalKm;
        if (totalDays !== undefined) trip.totalDays = totalDays;
        if (totalHours !== undefined) trip.totalHours = totalHours;
        if (minimumCharges !== undefined) trip.minimumCharges = minimumCharges;
        if (extraKmCharges !== undefined) trip.extraKmCharges = extraKmCharges;
        if (extraHoursCharges !== undefined) trip.extraHoursCharges = extraHoursCharges;
        if (tollParking !== undefined) trip.tollParking = tollParking;
        if (permitTax !== undefined) trip.permitTax = permitTax;
        if (nightCharges !== undefined) trip.nightCharges = nightCharges;
        if (fuelCharges !== undefined) trip.fuelCharges = fuelCharges;
        if (advanceAmount !== undefined) trip.advanceAmount = advanceAmount;
        if (totalAmount !== undefined) trip.totalAmount = totalAmount;
        if (balanceAmount !== undefined) trip.balanceAmount = balanceAmount;
        if (paidAmount !== undefined) trip.paidAmount = paidAmount;
        if (guestComments) trip.guestComments = guestComments;
        if (paymentStatus) trip.paymentStatus = paymentStatus;
        if (notes) trip.notes = notes;

        await trip.save();

        const populatedTrip = await Trip.findById(trip._id)
            .populate('driverId', 'name email')
            .populate('vehicleId', 'licensePlate make model');

        res.json({ success: true, data: populatedTrip, message: 'Trip updated successfully' });
    } catch (error) {
        console.error('Update trip error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

export const deleteTrip = async (req, res) => {
    try {
        const trip = await Trip.findOneAndDelete({
            _id: req.params.id,
            tenantId: req.user._id
        });

        if (!trip) {
            return res.status(404).json({ success: false, message: 'Trip not found' });
        }

        res.json({ success: true, message: 'Trip deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
