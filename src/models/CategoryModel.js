import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        image: {
            type: String
        },
        slug: {
            type: String
        }
    },
    {
        timestamps: true,
        unique: true
    }
);

const Category = mongoose.model('Category', CategorySchema);
export default Category;