import voucherService from "../services/voucherService.js";

const createVoucher = async (req, res) => {
    try {
        const { percent, maxUsage, minOrderValue, expiresAt } = req.body;
        if (!percent || !maxUsage || !minOrderValue || !expiresAt) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ thông tin"
            });
        }
        const respone = await voucherService.create(req.body);
        return res.status(201).json(respone);
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Failed to create voucher"
        });
    }
}

const getAll = async (req, res) => {
    try {
        const vouchers = await voucherService.getAll();
        return res.status(200).json(vouchers);
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Failed to get vouchers"
        });
    }
}

const updateVoucher = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const vouchers = await voucherService.update(id, data);
        if (!vouchers) {
            return res.status(404).json({
                message: "Không tìm thấy voucher"
            });
        }
        return res.status(200).json(vouchers);
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Failed to update vouchers"
        });
    }
}

const deleteVoucher = async (req, res) => {
    try {
        const id = req.params.id;
        const vouchers = await voucherService.deleteAVoucher(id);
        if (!vouchers) {
            return res.status(404).json({
                message: "Không tìm thấy voucher"
            });
        }
        return res.status(200).json(vouchers);
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Failed to delete vouchers"
        });
    }
}

const applyVoucher = async (req, res) => {
    try {
        const { code } = req.params;
        const applyVoucher = await voucherService.apply(code);
        return res.status(applyVoucher.statusCode).json({
            status: applyVoucher.status,
            message: applyVoucher.message,
            data: applyVoucher.data
        });
    } catch (error) {
        return res.status(500).json({
            status: 'ERR',
            message: error.message || 'Lỗi khi kiểm tra mã voucher'
        });
    }
};

export default {
    createVoucher, getAll, updateVoucher, deleteVoucher, applyVoucher
};