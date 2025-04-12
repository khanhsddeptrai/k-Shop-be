import stockImportService from "../services/stockImportService.js";

const createStockImport = async (req, res) => {
    try {
        const data = req.body;
        if (!data.productId) {
            return res.status(400).json({
                status: "ERR",
                message: "Không thìm thấy sản phẩm này",
            });
        }
        const response = await stockImportService.create(data);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: "Lỗi server: " + error.message,
        });
    }
};

const getAllStockImport = async (req, res) => {
    try {
        const response = await stockImportService.getAll();
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: "Lỗi server: " + error.message,
        });
    }
};

export default {
    createStockImport, getAllStockImport
};