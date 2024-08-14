/*
NOTES:
-- Allows us to connect to MongoDB using the function: connectToMongo()
 */

require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const databaseUrl = process.env.DATABASE_URL;       // databaseUrl uses data from .env file in the root directory

async function connectToMongo() {
    try {
        await mongoose.connect(databaseUrl);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

module.exports = {
    connectToMongo
};
