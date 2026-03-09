import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { protect } from './middleware/authMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import bankDetailRoutes from './routes/bankDetailRoutes.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Mount public routes
app.use('/api/auth', authRoutes);

// Mount protected routes
app.use('/api/categories', protect, categoryRoutes);
app.use('/api/customers', protect, customerRoutes);
app.use('/api/items', protect, inventoryRoutes);
app.use('/api/bookings', protect, bookingRoutes);
app.use('/api/expenses', protect, expenseRoutes);
app.use('/api/maintenance', protect, maintenanceRoutes);
app.use('/api/analytics', protect, analyticsRoutes);
app.use('/api/invoices', protect, invoiceRoutes);
app.use('/api/bank-details', protect, bankDetailRoutes);


// Error handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// Basic route
app.get('/', (req, res) => {
    res.send('Rental ERP API is running...');
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on ${HOST}:${PORT}`);
});
