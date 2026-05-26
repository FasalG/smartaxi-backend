import DriverSettlement from '../models/DriverSettlement.js';
import Trip from '../models/Trip.js';
import { v2 as cloudinary } from 'cloudinary';

// Configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// @desc    Get pending/completed unsettled trips for the logged-in driver
// @route   GET /smart/settlements/pending-trips
// @access  Private (Driver only)
export const getPendingTrips = async (req, res) => {
    try {
        if (req.user.role !== 'driver') {
            return res.status(403).json({ success: false, message: 'Access denied: Only drivers can fetch pending trips' });
        }

        // 1. Fetch completed trips for this driver that are not fully settled
        const trips = await Trip.find({
            driverId: req.user._id,
            status: 'completed',
            driverPaymentStatus: { $ne: 'confirmed' }
        })
        .populate('vehicleId', 'licensePlate make model')
        .populate('customerId', 'name phone address')
        .sort({ startTime: -1 });

        // 2. Fetch driver's pending (unapproved) settlements to identify already submitted allocations
        const pendingSettlements = await DriverSettlement.find({
            driverId: req.user._id,
            status: 'pending'
        });

        // 3. Sum up submitted/pending allocations per trip
        const submittedAllocations = {};
        pendingSettlements.forEach(settlement => {
            settlement.trips.forEach(alloc => {
                const tripIdStr = alloc.tripId.toString();
                submittedAllocations[tripIdStr] = (submittedAllocations[tripIdStr] || 0) + alloc.allocatedAmount;
            });
        });

        // 4. Append submittedAmount to each trip object
        const data = trips.map(trip => {
            const tripObj = trip.toObject();
            tripObj.submittedAmount = submittedAllocations[trip._id.toString()] || 0;
            return tripObj;
        });

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching driver pending trips:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Submit a new handover/settlement request
// @route   POST /smart/settlements
// @access  Private (Driver only)
export const createSettlement = async (req, res) => {
    try {
        if (req.user.role !== 'driver') {
            return res.status(403).json({ success: false, message: 'Access denied: Only drivers can submit handovers' });
        }

        const { amount, paymentMethod, paymentDate, referenceId, receiptUrl, notes, trips } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Valid handover amount is required' });
        }

        if (!paymentMethod) {
            return res.status(400).json({ success: false, message: 'Payment method is required' });
        }

        if (!trips || !Array.isArray(trips) || trips.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one trip allocation is required' });
        }

        const tenantId = req.user.tenantId;
        if (!tenantId) {
            return res.status(400).json({ success: false, message: 'Tenant association not found for driver' });
        }

        // Upload receipt screenshot to Cloudinary if it is base64
        let uploadedUrl = '';
        if (receiptUrl && receiptUrl.startsWith('data:image/')) {
            const uploadResult = await cloudinary.uploader.upload(receiptUrl, {
                folder: 'smarttaxi',
                resource_type: 'auto'
            });
            uploadedUrl = uploadResult.secure_url;
        } else if (receiptUrl) {
            uploadedUrl = receiptUrl;
        }

        // Create the DriverSettlement record
        const settlement = await DriverSettlement.create({
            driverId: req.user._id,
            tenantId,
            amount,
            paymentMethod,
            paymentDate: paymentDate || new Date(),
            referenceId,
            receiptUrl: uploadedUrl,
            notes,
            trips
        });

        // Mark all allocated trips' driverPaymentStatus to 'submitted'
        for (const item of trips) {
            await Trip.findByIdAndUpdate(item.tripId, { driverPaymentStatus: 'submitted' });
        }

        res.status(201).json({ 
            success: true, 
            data: settlement, 
            message: 'Handover request submitted successfully. Waiting for admin approval.' 
        });
    } catch (error) {
        console.error('Error creating settlement:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get handover history for the logged-in driver
// @route   GET /smart/settlements/driver
// @access  Private (Driver only)
export const getDriverSettlements = async (req, res) => {
    try {
        if (req.user.role !== 'driver') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const settlements = await DriverSettlement.find({ driverId: req.user._id })
            .populate({
                path: 'trips.tripId',
                select: 'customerName startTime totalAmount driverSettlementAmount driverSettlementPaidAmount'
            })
            .sort({ createdAt: -1 });

        res.json({ success: true, data: settlements });
    } catch (error) {
        console.error('Error fetching driver settlements:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get all driver handover requests (Admin view)
// @route   GET /smart/settlements/admin
// @access  Private (Admin only)
export const getAdminSettlements = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied: Only admins can review settlements' });
        }

        const settlements = await DriverSettlement.find({ tenantId: req.user._id })
            .populate('driverId', 'name email')
            .populate({
                path: 'trips.tripId',
                select: 'customerName startTime totalAmount driverSettlementAmount driverSettlementPaidAmount'
            })
            .sort({ createdAt: -1 });

        res.json({ success: true, data: settlements });
    } catch (error) {
        console.error('Error fetching admin settlements:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Approve a pending handover and apply allocations to trips
// @route   PUT /smart/settlements/:id/approve
// @access  Private (Admin only)
export const approveSettlement = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const settlement = await DriverSettlement.findById(req.params.id);
        if (!settlement) {
            return res.status(404).json({ success: false, message: 'Settlement not found' });
        }

        if (settlement.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Settlement request has already been processed' });
        }

        // Apply trip allocations
        for (const item of settlement.trips) {
            const trip = await Trip.findById(item.tripId);
            if (trip) {
                // Add the allocated amount to the paid amount
                trip.driverSettlementPaidAmount = (trip.driverSettlementPaidAmount || 0) + item.allocatedAmount;

                // Check if trip is fully settled
                const remaining = trip.driverSettlementAmount - trip.driverSettlementPaidAmount;
                if (remaining <= 0) {
                    trip.driverPaymentStatus = 'confirmed';
                } else {
                    trip.driverPaymentStatus = 'pending'; // Reverts to pending with adjusted remaining balance
                }
                await trip.save();
            }
        }

        // Mark settlement as approved
        settlement.status = 'approved';
        settlement.approvedAt = new Date();
        settlement.adminNotes = req.body.adminNotes || '';
        await settlement.save();

        res.json({ success: true, data: settlement, message: 'Settlement approved and trip accounts updated successfully' });
    } catch (error) {
        console.error('Error approving settlement:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Reject a pending handover and release trip statuses back to pending
// @route   PUT /smart/settlements/:id/reject
// @access  Private (Admin only)
export const rejectSettlement = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const settlement = await DriverSettlement.findById(req.params.id);
        if (!settlement) {
            return res.status(404).json({ success: false, message: 'Settlement not found' });
        }

        if (settlement.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Settlement request has already been processed' });
        }

        // Revert all associated trips' driverPaymentStatus to pending
        for (const item of settlement.trips) {
            await Trip.findByIdAndUpdate(item.tripId, { driverPaymentStatus: 'pending' });
        }

        // Mark settlement as rejected
        settlement.status = 'rejected';
        settlement.adminNotes = req.body.adminNotes || 'Handover rejected by Admin';
        await settlement.save();

        res.json({ success: true, data: settlement, message: 'Settlement request rejected successfully' });
    } catch (error) {
        console.error('Error rejecting settlement:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
