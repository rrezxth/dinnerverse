require('dotenv').config();
const mongoose = require('mongoose');
const databaseUrl = process.env.DATABASE_URL;

async function connectToMongo() {
    try {
        await mongoose.connect(databaseUrl);
    } catch (error) {
        process.exit(1);
    }
}

module.exports = {
    connectToMongo
};
