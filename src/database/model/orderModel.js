/*
NOTES:
-- Order must have:
[user_id(type-User), restaurant_id, items(type-array), total_price, status, pickup_time]
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    restaurant_id: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
    },
    items: [
        {
            item_id: {
                type: Schema.Types.ObjectId,
                ref: 'Item',
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            }
        }
    ],
    total_price: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['Cancelled', 'Preparing', 'Ready for Pickup', 'Complete'],
        default: 'Preparing',
        required: true,
    },
    pickup_time: {
        type: Date,
        required: true,
    }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
