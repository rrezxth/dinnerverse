/*
NOTES:
-- Reservation must have:
[restaurant_id(type-Restaurant), user_id(type-User), reservation_datetime, number_of_guests]
*/

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reservationSchema = new Schema({
    restaurant_id: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    reservation_datetime: {
        type: Date,
        required: true,
    },
    number_of_guests: {
        type: Number,
        required: true,
    }
}, { timestamps: true });

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
