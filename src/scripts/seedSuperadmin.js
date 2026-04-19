import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const seedSuperadmin = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in environment variables');
        }

        await mongoose.connect(process.env.MONGODB_URI);

        const email = 'developer@smarttaxi.com';
        let user = await User.findOne({ email });

        if (user) {
            console.log('Superadmin already exists! Updating credentials to ensure access...');
            user.password = 'SmartTaxiDeveloper_2026!';
            user.isVerified = true;
            await user.save();
            console.log('✅ Superadmin updated: developer@smarttaxi.com / SmartTaxiDeveloper_2026!');
        } else {
            await User.create({
                name: 'System Developer',
                email: email,
                password: 'SmartTaxiDeveloper_2026!',
                role: 'superadmin',
                isVerified: true,
                tenantId: null // Independent
            });
            console.log('✅ Superadmin created: developer@smarttaxi.com / SmartTaxiDeveloper_2026!');
        }
        process.exit();
    } catch (error) {
        console.error('Error seeding superadmin:', error);
        process.exit(1);
    }
};

seedSuperadmin();
