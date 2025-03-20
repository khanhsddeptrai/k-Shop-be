import mongoose from "mongoose";

const StockImportSchema = new mongoose.Schema(
    {
        quantity: {
            type: Number,
            required: true
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        importDay: {
            type: Date,
            required: true,
            delete: Date.now()
        },
        description: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

const StockImport = mongoose.model('StockImport', StockImportSchema);
export default StockImport;