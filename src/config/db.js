import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host} `);

        // Drop old clashing expense indexes programmatically to avoid duplicate null errors
        const db = conn.connection.db;
        const collections = await db.listCollections({ name: 'expenses' }).toArray();
        if (collections.length > 0) {
            const expensesCollection = db.collection('expenses');
            try { await expensesCollection.dropIndex('expenseNumber_1'); } catch (e) {}
            try { await expensesCollection.dropIndex('expense_number_1'); } catch (e) {}
            console.log('Old expense unique indexes cleared successfully');
        }

        console.log('MongoDB Connected successfully');
    } catch (error) {
        console.error(`Error: ${error.message} `);
        process.exit(1);
    }
};

export default connectDB;
