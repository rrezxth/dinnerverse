const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const menuSchema = new Schema({
    items: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Item',
            required: true,
        }
    ],
    name: {
        type: String,
        required: true,
    },
    restaurant_id: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
    }
}, { timestamps: true });

const Menu = mongoose.model('Menu', menuSchema);

module.exports = Menu;
