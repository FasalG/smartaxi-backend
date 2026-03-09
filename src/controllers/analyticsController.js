import Expense from '../models/Expense.js';
import RentalItem from '../models/RentalItem.js';
import Booking from '../models/Booking.js';

// @desc    Get dashboard stats
// @route   GET /api/analytics/stats
export const getStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const totalRevenue = await Booking.aggregate([
            { $match: { user: userId, status: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const activeRentalsCount = await Booking.countDocuments({ status: 'active', user: userId });

        const totalItems = await RentalItem.aggregate([
            { $match: { user: userId } },
            { $group: { _id: null, total: { $sum: '$total_quantity' } } }
        ]);

        const availableItems = await RentalItem.aggregate([
            { $match: { user: userId } },
            { $group: { _id: null, total: { $sum: '$available_quantity' } } }
        ]);

        const pendingBookingsCount = await Booking.countDocuments({ status: 'pending', user: userId });

        const totalExpenses = await Expense.aggregate([
            { $match: { user: userId } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const data = {
            totalRevenue: totalRevenue[0]?.total || 0,
            activeRentalsCount,
            availableItemsCount: availableItems[0]?.total || 0,
            totalItemsCount: totalItems[0]?.total || 0,
            pendingBookingsCount,
            totalExpenses: totalExpenses[0]?.total || 0,
        };

        res.status(200).json({ success: true, data, message: null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get recent activities
// @route   GET /api/analytics/recent
export const getRecentActivities = async (req, res) => {
    try {
        const recentRentals = await Booking.find({ user: req.user._id })
            .populate('customer', 'name')
            .populate('items.item', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({ success: true, data: { recentRentals }, message: null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
