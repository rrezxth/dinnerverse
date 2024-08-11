/*
NOTES:
-- Item must have:
[menu_id(type-Menu), description, alias, name, price, photo(OPTIONAL)]
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    menu_id: {
        type: Schema.Types.ObjectId,
        ref: 'Menu',
    },
    photo: {
        type: String,
    },
    description: {
        type: String,
        required: true,
    },
    alias: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    }
}, { timestamps: true });

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
