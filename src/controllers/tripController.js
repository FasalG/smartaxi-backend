import mongoose from 'mongoose';
import Trip from '../models/Trip.js';

// @desc    Get all trips for a tenant (Admin view)
// @route   GET /api/trips
// @access  Private/Admin
export const getTrips = async (req, res) => {
    try {
        const trips = await Trip.find({ tenantId: req.user._id })
            .populate('driverId', 'name email')
            .populate('vehicleId', 'licensePlate make model')
            .populate('customerId', 'name phone address');
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
            .populate('vehicleId', 'licensePlate make model')
            .populate('customerId', 'name phone address');
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
            customerId,
            customerName,
            startLocation,
            startTime,
            endLocation,
            endTime,
            startOdometer,
            endOdometer,
            totalKm,
            totalDays,
            totalHours,
            fuelCharges,
            tollParking,
            driverBata,
            permitAmount,
            baseInvoiceAmount,
            advanceAmount,
            driverAdvanceAmount,
            paidAmount,
            totalAmount,
            balanceAmount,
            driverSettlementAmount,
            driverEarnings,
            tripType,
            status,
            paymentStatus,
            driverPaymentStatus,
            otherExpensesList,
            notes
        } = req.body;


        const tenantId = req.user.role === 'admin' ? req.user._id : req.user.tenantId;

        const trip = await Trip.create({
            driverId: driverId || req.user._id,
            vehicleId,
            startLocation,
            startTime: startTime || Date.now(),
            endLocation,
            endTime,
            customerId,
            customerName,
            tripType: tripType || 'Cash',
            startOdometer,
            endOdometer,
            totalKm: totalKm || 0,
            totalDays: totalDays || 0,
            totalHours: totalHours || 0,
            fuelCharges: fuelCharges || 0,
            tollParking: tollParking || 0,
            driverBata: driverBata || 0,
            permitAmount: permitAmount || 0,
            baseInvoiceAmount: baseInvoiceAmount || 0,
            advanceAmount: advanceAmount || 0,
            driverAdvanceAmount: driverAdvanceAmount || 0,
            paidAmount: paidAmount || 0,
            totalAmount: totalAmount || 0,
            balanceAmount: balanceAmount || 0,
            driverSettlementAmount: driverSettlementAmount || 0,
            driverEarnings: driverEarnings || 0,
            status: status || 'in-progress',
            paymentStatus: paymentStatus || 'pending',
            driverPaymentStatus: driverPaymentStatus || 'pending',
            otherExpensesList: otherExpensesList || [],
            notes,
            tenantId
        });


        const populatedTrip = await Trip.findById(trip._id)
            .populate('driverId', 'name email')
            .populate('vehicleId', 'licensePlate make model')
            .populate('customerId', 'name phone address');

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
            customerId,
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
            tollParking,
            fuelCharges,
            driverBata,
            otherExpenses,
            advanceAmount,
            driverAdvanceAmount,
            baseInvoiceAmount,
            permitAmount,
            totalAmount,
            balanceAmount,

            paidAmount,
            driverSettlementAmount,
            guestComments,
            paymentStatus,
            tripType, // to save at end
            otherExpensesList,
            notes,
            driverPaymentStatus,
            driverSettlementMethod,
            driverPaymentSubmittedAt,
            adminConfirmedAt,
            driverEarnings
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
        if (customerId) trip.customerId = customerId;
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
        if (tollParking !== undefined) trip.tollParking = tollParking;
        if (fuelCharges !== undefined) trip.fuelCharges = fuelCharges;
        if (driverBata !== undefined) trip.driverBata = driverBata;
        if (otherExpenses !== undefined) trip.otherExpenses = otherExpenses;
        if (advanceAmount !== undefined) trip.advanceAmount = advanceAmount;
        if (driverAdvanceAmount !== undefined) trip.driverAdvanceAmount = driverAdvanceAmount;
        if (totalAmount !== undefined) trip.totalAmount = totalAmount;
        if (paidAmount !== undefined) trip.paidAmount = paidAmount;
        if (guestComments) trip.guestComments = guestComments;
        if (paymentStatus) trip.paymentStatus = paymentStatus;
        if (tripType) trip.tripType = tripType;
        if (otherExpensesList) trip.otherExpensesList = otherExpensesList;
        if (baseInvoiceAmount !== undefined) trip.baseInvoiceAmount = baseInvoiceAmount;
        if (permitAmount !== undefined) trip.permitAmount = permitAmount;
        if (notes) trip.notes = notes;
        if (driverPaymentStatus) trip.driverPaymentStatus = driverPaymentStatus;
        if (driverSettlementMethod) trip.driverSettlementMethod = driverSettlementMethod;
        if (driverPaymentSubmittedAt) trip.driverPaymentSubmittedAt = driverPaymentSubmittedAt;
        if (adminConfirmedAt) trip.adminConfirmedAt = adminConfirmedAt;


        // Automatic Calculations for consistency
        const total = trip.totalAmount;
        const advance = trip.advanceAmount;
        const paid = trip.paidAmount;
        const driverAdvance = trip.driverAdvanceAmount || 0;

        // 1. Recalculate Total Amount (Billed to Customer) ONLY if not provided
        // This allows admin to manually override the gross total, including setting it to 0.
        if (totalAmount !== undefined) {
            trip.totalAmount = totalAmount;
        } else {
            trip.totalAmount = (trip.baseInvoiceAmount || 0) + (trip.tollParking || 0) + (trip.driverBata || 0) + (trip.permitAmount || 0);
        }

        // 2. Recalculate Balance (Customer Credit/Debit)
        trip.balanceAmount = trip.totalAmount - (advance + paid);

        // 3. Recalculate Driver Earnings (Percentage of Base Invoice ONLY)
        if (baseInvoiceAmount !== undefined && driverEarnings === undefined) {
            const vehicle = await mongoose.model('Vehicle').findById(trip.vehicleId);
            if (vehicle && vehicle.driverPaymentPercentage) {
                trip.driverEarnings = Math.round(((trip.baseInvoiceAmount || 0) * vehicle.driverPaymentPercentage) / 100);
            }
        } else if (driverEarnings !== undefined) {
            trip.driverEarnings = driverEarnings;
        }

        // 4. Recalculate Driver Settlement Amount
        const fuel = trip.fuelCharges || 0;
        const toll = trip.tollParking || 0;
        const bata = trip.driverBata || 0;
        const permit = trip.permitAmount || 0;
        const other = trip.otherExpenses || 0;
        const earnings = trip.driverEarnings || 0;

        // Settlement = (Cash Recvd) - (Expenses) - (Earnings)
        trip.driverSettlementAmount = (driverAdvance + paid) - (fuel + toll + bata + permit + other) - earnings;


        // Manual override for driver settlement if provided
        if (driverSettlementAmount !== undefined) {
            trip.driverSettlementAmount = driverSettlementAmount;
        }

        await trip.save();

        const populatedTrip = await Trip.findById(trip._id)
            .populate('driverId', 'name email')
            .populate('vehicleId', 'licensePlate make model')
            .populate('customerId', 'name phone address');

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
