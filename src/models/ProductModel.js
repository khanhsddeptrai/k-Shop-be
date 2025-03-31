import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        image: {
            type: String,
            required: true
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        rating: {
            type: String
        },
        discount: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Discount'
        },
        countInStock: {
            type: Number
        },
        description: {
            type: String
        },
        slug: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

const Product = mongoose.model('Product', ProductSchema);
export default Product;