import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function fix() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const collection = mongoose.connection.collection('customers');
        const indexes = await collection.indexes();
        console.log('Current indexes:', JSON.stringify(indexes, null, 2));

        if (indexes.some(idx => idx.name === 'customer_code_1')) {
            await collection.dropIndex('customer_code_1');
            console.log('Dropped customer_code_1 index');
        } else {
            console.log('customer_code_1 index not found');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fix();
