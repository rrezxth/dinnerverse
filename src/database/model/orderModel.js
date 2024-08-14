/*
NOTES:
-- Order must have:
[user_id(type-User), restaurant_id, items(type-array), total_price, status, pickup_time]
-- For items(type-array), we are using a hybrid approach so we get the benefits of referencing
the item (if available) while also storing/saving information such as name and price
if the item object itself gets deleted from the menu and database.
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
            name: { // Store the current name
                type: String,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            price: { // Store the current price
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
