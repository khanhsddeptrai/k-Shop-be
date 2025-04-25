import Voucher from "../models/VoucherModel.js";

const create = async ({ percent, maxUsage, minOrderValue, expiresAt }) => {
    try {
        if (percent < 0 || percent > 100) {
            throw new Error("Percent must be between 0 and 100");
        }
        if (maxUsage < 1) {
            throw new Error("Max usage must be at least 1");
        }
        if (minOrderValue < 0) {
            throw new Error("Minimum order value cannot be negative");
        }
        if (new Date(expiresAt) <= new Date()) {
            throw new Error("Expiration date must be in the future");
        }

        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let prefixVoucher = process.env.PREFIX_VOUCHER
        let result = prefixVoucher;
        for (let i = 0; i < process.env.LENGTH_VOUCHER; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        const existingVoucher = await Voucher.findOne({ code: result });
        if (existingVoucher) {
            throw new Error("Voucher code already exists");
        }

        const voucher = await Voucher.create({
            code: result,
            percent,
            maxUsage,
            minOrderValue,
            expiresAt,
            status: "active"
        });
        return {
            status: "success",
            message: "Thêm voucher thành công",
            data: voucher
        }
    } catch (error) {
        throw new Error(error.message || "Failed to create voucher");
    }
};

const getAll = async () => {
    try {
        const vouchers = await Voucher.find({}).sort({ createdAt: -1 });
        return {
            status: "success",
            message: "Lấy danh sách voucher thành công",
            data: vouchers
        }
    } catch (error) {
        throw new Error(error.message || "Failed to get vouchers");
    }
};

const update = async (id, data) => {
    try {
        const voucher = await Voucher.findById(id);
        if (!voucher) {
            throw new Error("Voucher không tồn tại");
        }
        const { percent, maxUsage, minOrderValue, expiresAt } = data;
        if (percent !== undefined) {
            if (percent < 0 || percent > 100) {
                throw new Error("Percent phải nằm trong khoảng từ 0 đến 100");
            }
            voucher.percent = percent;
        }
        if (maxUsage !== undefined) {
            if (maxUsage < 1) {
                throw new Error("Max usage phải lớn hơn hoặc bằng 1");
            }
            if (maxUsage < voucher.usedCount) {
                throw new Error("Max usage không thể nhỏ hơn số lần đã sử dụng");
            }
            voucher.maxUsage = maxUsage;
        }
        if (minOrderValue !== undefined) {
            if (minOrderValue < 0) {
                throw new Error("Giá trị đơn hàng tối thiểu không thể âm");
            }
            voucher.minOrderValue = minOrderValue;
        }
        if (expiresAt !== undefined) {
            if (new Date(expiresAt) <= new Date()) {
                throw new Error("Ngày hết hạn phải ở tương lai");
            }
            voucher.expiresAt = expiresAt;
        }
        const updatedVoucher = await voucher.save();
        return {
            status: "success",
            message: "Cập nhật voucher thành công",
            data: updatedVoucher
        }
    } catch (error) {
        throw new Error(error.message || "Failed to get vouchers");
    }
}

const deleteAVoucher = async (id) => {
    try {
        const voucher = await Voucher.findById(id);
        if (!voucher) {
            return {
                status: "ERR",
                message: "Voucher không tồn tại"
            };
        }
        await voucher.deleteOne();
        return {
            status: "success",
            message: "Xóa voucher thành công"
        }
    } catch (error) {
        throw new Error(error.message || "Failed to get vouchers");
    }
}

const apply = async (code) => {
    try {
        const voucher = await Voucher.findOne({ code });
        if (!voucher) {
            return {
                status: 'ERR',
                message: 'Mã giảm giá không tồn tại',
                statusCode: 404
            };
        }
        if (new Date(voucher.expiresAt) < new Date()) {
            return {
                status: 'ERR',
                message: 'Mã giảm giá đã hết hạn',
                statusCode: 404
            };
        }
        if (voucher.usedCount >= voucher.maxUsage) {
            return {
                status: 'ERR',
                message: 'Mã giảm giá đã hết lượt sử dụng',
                statusCode: 404
            };
        }
        return {
            status: "success",
            message: "Áp dụng mã giảm giá thành công",
            statusCode: 200,
            data: voucher
        }
    } catch (error) {
        throw new Error(error.message || "Failed to get vouchers");
    }
}



export default {
    create, getAll, update, deleteAVoucher, apply
};