// trigger nodemon restart
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { protect } from './middleware/authMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';

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
app.use('/api/vehicles', protect, vehicleRoutes);
app.use('/api/trips', protect, tripRoutes);
app.use('/api/maintenance', protect, maintenanceRoutes);


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

const PORT = process.env.PORT || 5050;
console.log('--- SERVER STARTING ON PORT:', PORT);
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on ${HOST}:${PORT}`);
});
