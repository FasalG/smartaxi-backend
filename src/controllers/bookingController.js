import Booking from '../models/Booking.js';
import Maintenance from '../models/Maintenance.js';
import RentalItem from '../models/RentalItem.js';
import PDFDocument from 'pdfkit';

// Helper to check availability for multiple items
const checkAvailability = async (items, startDate, endDate, excludeBookingId = null, userId) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const errors = [];

    for (const itemRequest of items) {
        const rentalItem = await RentalItem.findOne({ _id: itemRequest.item, user: userId });
        if (!rentalItem) {
            errors.push(`Item ${itemRequest.item} not found`);
            continue;
        }

        // 1. Get total quantity
        const totalQty = rentalItem.total_quantity;

        // 2. Find overlapping bookings for this specific item
        const overlappingBookings = await Booking.find({
            user: userId,
            _id: { $ne: excludeBookingId },
            status: { $in: ['pending', 'active', 'confirmed'] },
            'items.item': itemRequest.item,
            $or: [
                { start_date: { $lt: end }, end_date: { $gt: start } }
            ]
        });

        const bookedQty = overlappingBookings.reduce((sum, b) => {
            const bookedItem = b.items.find(i => i.item.toString() === itemRequest.item.toString());
            return sum + (bookedItem ? bookedItem.quantity : 0);
        }, 0);

        // 3. Find overlapping maintenance
        const overlappingMaintenance = await Maintenance.find({
            user: userId,
            item: itemRequest.item,
            status: { $in: ['scheduled', 'in_progress', 'overdue'] },
            $or: [
                { scheduled_date: { $lt: end }, completed_date: { $exists: false } },
                { scheduled_date: { $lt: end }, completed_date: { $gt: start } }
            ]
        });

        // Assuming each maintenance record takes 1 unit out of service
        const maintenanceQty = overlappingMaintenance.length;

        const available = totalQty - bookedQty - maintenanceQty;

        if (itemRequest.quantity > available) {
            errors.push(`"${rentalItem.name}" is not available (Available: ${available}, Requested: ${itemRequest.quantity})`);
        }
    }

    if (errors.length > 0) {
        throw new Error(errors.join(' | '));
    }

    return true;
};

// @desc    Get all bookings
// @route   GET /api/bookings
export const getBookings = async (req, res) => {
    try {
        let bookings = await Booking.find({ user: req.user._id })
            .populate('customer')
            .populate('items.item')
            .populate('bank_detail');

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        // Auto-update status based on dates if not manually cancelled/closed/confirmed
        const updatedBookings = bookings.map(booking => {
            if (['cancelled', 'closed', 'confirmed'].includes(booking.status)) return booking;

            const start = new Date(booking.start_date);
            const end = new Date(booking.end_date);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);

            let newStatus = booking.status;
            if (now >= start && now <= end) {
                newStatus = 'active';
            } else if (now < start) {
                newStatus = 'pending';
            } else if (now > end) {
                // If past end date but not closed, keep it as active (awaiting return)
                newStatus = 'active';
            }

            if (newStatus !== booking.status) {
                booking.status = newStatus;
                // No save here, just in-memory for the current request
            }
            return booking;
        });

        res.status(200).json({ success: true, data: updatedBookings, message: null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message  });
    }
};

// @desc    Create a booking
// @route   POST /api/bookings
export const createBooking = async (req, res) => {
    try {
        const { items, start_date, end_date } = req.body;

        // Check availability
        await checkAvailability(items, start_date, end_date, null, req.user._id);

        // Calculate amount on backend for security/integrity
        const start = new Date(start_date);
        const end = new Date(end_date);
        const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) || 1;

        let calculatedAmount = 0;
        for (const itemRequest of items) {
            const rentalItem = await RentalItem.findById(itemRequest.item);
            if (rentalItem) {
                calculatedAmount += (rentalItem.daily_rate * itemRequest.quantity * diffDays);
                // Note: We could use weekly_rate logic here if diffDays >= 7
            }
        }

        const newBooking = new Booking({
            ...req.body,
            amount: calculatedAmount, // Override frontend amount
            duration_days: diffDays,
            user: req.user._id
        });
        const booking = await newBooking.save();
        res.status(201).json({ success: true, data: booking, message: 'Booking created successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message  });
    }
};

// @desc    Update a booking
// @route   PUT /api/bookings/:id
export const updateBooking = async (req, res) => {
    try {
        const { items, start_date, end_date } = req.body;

        // Check availability excluding current booking
        await checkAvailability(items, start_date, end_date, req.params.id, req.user._id);

        const start = new Date(start_date);
        const end = new Date(end_date);
        const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) || 1;

        let calculatedAmount = 0;
        for (const itemRequest of items) {
            const rentalItem = await RentalItem.findById(itemRequest.item);
            if (rentalItem) {
                calculatedAmount += (rentalItem.daily_rate * itemRequest.quantity * diffDays);
            }
        }

        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { ...req.body, amount: calculatedAmount, duration_days: diffDays },
            { new: true }
        ).populate('customer').populate('items.item');

        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found or unauthorized'  });
        res.status(200).json({ success: true, data: booking, message: null });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message  });
    }
};

// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
export const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found or unauthorized'  });
        res.status(200).json({ success: true, data: null, message: 'Booking deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message  });
    }
};

// @desc    Generate an invoice PDF
// @route   GET /api/bookings/:id/invoice
export const generateInvoice = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id })
            .populate('customer')
            .populate('items.item');

        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found'  });

        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Invoice-${booking.booking_number}.pdf"`);
        doc.pipe(res);

        // Header
        doc.fontSize(20).font('Helvetica-Bold').text('INVOICE', { align: 'center' }).moveDown();

        // Customer Details
        doc.fontSize(12).font('Helvetica-Bold').text('Bill To:').font('Helvetica');
        doc.text(`Name: ${booking.customer.name}`);
        doc.text(`Email: ${booking.customer.email}`);
        doc.text(`Phone: ${booking.customer.phone}`).moveDown();

        // Booking Info
        doc.font('Helvetica-Bold').text('Booking Information:').font('Helvetica');
        doc.text(`Booking Number: ${booking.booking_number}`);
        doc.text(`Date: ${new Date().toLocaleDateString()}`);
        doc.text(`Rental Period: ${new Date(booking.start_date).toLocaleDateString()} to ${new Date(booking.end_date).toLocaleDateString()}`).moveDown(2);

        // Table Header
        let y = doc.y;
        doc.font('Helvetica-Bold');
        doc.text('Item', 50, y);
        doc.text('Qty', 250, y);
        doc.text('Rate/Day', 350, y);
        doc.text('Total', 450, y);
        doc.moveTo(50, y + 15).lineTo(500, y + 15).stroke();
        doc.font('Helvetica');
        y += 25;

        // Items
        for (const i of booking.items) {
            doc.text(i.item.name, 50, y);
            doc.text(i.quantity.toString(), 250, y);
            doc.text(`Rs. ${i.rate}`, 350, y);
            doc.text(`Rs. ${i.rate * i.quantity * booking.duration_days}`, 450, y);
            y += 20;
        }

        doc.moveTo(50, y).lineTo(500, y).stroke();
        y += 15;

        // Total
        doc.font('Helvetica-Bold');
        doc.text(`Total Duration: ${booking.duration_days} Days`, 50, y);
        doc.text(`Total Amount: Rs. ${booking.amount}`, 350, y);

        if (booking.initial_payment_received > 0) {
            y += 20;
            doc.text(`Initial Payment Received: Rs. ${booking.initial_payment_received}`, 350, y);
            y += 20;
            doc.text(`Amount Due: Rs. ${booking.amount - booking.initial_payment_received}`, 350, y);
        }

        doc.end();

    } catch (error) {
        if (!res.headersSent) res.status(500).json({ success: false, message: error.message  });
    }
};

// @desc    Generate a cash receipt PDF
// @route   GET /api/bookings/:id/receipt
export const generateReceipt = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id })
            .populate('customer');

        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found'  });
        if (booking.initial_payment_received <= 0) return res.status(400).json({ success: false, message: 'No initial payment received'  });

        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Receipt-${booking.booking_number}.pdf"`);
        doc.pipe(res);

        // Header
        doc.fontSize(20).font('Helvetica-Bold').text('CASH RECEIPT', { align: 'center' }).moveDown();

        doc.fontSize(12).font('Helvetica').text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' }).moveDown(2);

        doc.font('Helvetica-Bold').text('Received From: ', { continued: true }).font('Helvetica').text(booking.customer.name);
        doc.text(`Email: ${booking.customer.email}`).moveDown();

        doc.text('The sum of: ', { continued: true }).font('Helvetica-Bold').text(`Rs. ${booking.initial_payment_received}`).font('Helvetica').moveDown();

        doc.font('Helvetica-Bold').text('For Payment Of:').font('Helvetica');
        doc.text(`Booking Reference: ${booking.booking_number}`);
        doc.text(`Rental Period: ${new Date(booking.start_date).toLocaleDateString()} to ${new Date(booking.end_date).toLocaleDateString()}`);
        doc.text(`Payment Method: ${booking.payment_method.toUpperCase()}`).moveDown(2);

        doc.moveTo(50, doc.y).lineTo(500, doc.y).stroke().moveDown();

        doc.font('Helvetica-Bold');
        doc.text(`Total Booking Amount: Rs. ${booking.amount}`);
        doc.text(`Balance Due: Rs. ${booking.amount - booking.initial_payment_received}`).moveDown(3);

        doc.font('Helvetica').text('Authorized Signature: _______________________');

        doc.end();

    } catch (error) {
        if (!res.headersSent) res.status(500).json({ success: false, message: error.message  });
    }
};
