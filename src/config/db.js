import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';
import RentalItem from '../models/RentalItem.js';

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host} `);

        // Sync indexes to drop any old globally unique constraints (e.g. name_1, sku_1)
        // and build the new compound unique constraints on boot.
        await Category.syncIndexes();
        await RentalItem.syncIndexes();
        console.log('MongoDB Indexes Synchronized');
    } catch (error) {
        console.error(`Error: ${error.message} `);
        process.exit(1);
    }
};

export default connectDB;
