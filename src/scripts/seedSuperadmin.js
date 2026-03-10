import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const seedSuperadmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const email = 'developer@smarttaxi.com';
        const exists = await User.findOne({ email });

        if (exists) {
            console.log('Superadmin already exists!');
        } else {
            await User.create({
                name: 'System Developer',
                email: email,
                password: 'SmartTaxiDeveloper_2026!',
                role: 'superadmin',
                tenantId: null // Independent
            });
            console.log('Superadmin created: developer@smarttaxi.com / SmartTaxiDeveloper_2026!');
        }
        process.exit();
    } catch (error) {
        console.error('Error seeding superadmin:', error);
        process.exit(1);
    }
};

seedSuperadmin();
