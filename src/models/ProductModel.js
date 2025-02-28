const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    countInStock: {
        type: Number,
        required: true
    },
});