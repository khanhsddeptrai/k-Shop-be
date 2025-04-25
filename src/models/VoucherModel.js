import mongoose from "mongoose";

const VoucherSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true
        },
        percent: {
            type: Number,
            required: true
        },
        maxUsage: {
            type: Number,
            required: true
        },
        usedCount: {
            type: Number,
            default: 0
        },
        minOrderValue: {
            type: Number,
            required: true,
            min: 0
        },
        expiresAt: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ["active", "expired", "disabled"],
            default: "disabled"
        }
    },
    {
        timestamps: true
    }
);

const Voucher = mongoose.model('Voucher', VoucherSchema);
export default Voucher;