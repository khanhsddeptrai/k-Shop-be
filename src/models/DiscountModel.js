const mongoose = require('mongoose');

const DiscountSchema = new mongoose.Schema(
    {
        dayStart: {
            type: String,
            required: true
        },
        dayEnd: {
            type: String,
            required: true
        },
        percent: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Discount = mongoose.model('Discount', DiscountSchema);
module.exports = Discount;