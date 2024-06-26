require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const databaseUrl = process.env.DATABASE_URL;

async function connectToMongo() {
    try {
        await mongoose.connect(databaseUrl);
        console.log('MongoDB Connected..');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

module.exports = {
    connectToMongo
};
