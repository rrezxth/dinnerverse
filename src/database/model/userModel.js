const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
    },
    username: {         // restaurants ONLY
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ['customer', 'restaurant'],
        required: true,
    },

}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;