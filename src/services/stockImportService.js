import StockImport from "../models/StockImport.js";
import Product from "../models/ProductModel.js";

const create = async (data) => {
    try {
        data.quantity = parseInt(data.quantity);
        if (typeof data.quantity !== "number" || isNaN(data.quantity)) {
            return {
                status: "ERR",
                message: "Số lượng phải là một số hợp lệ",
            };
        }
        if (data.quantity < 0) {
            return {
                status: "ERR",
                message: "Số lượng không được nhỏ hơn 0",
            };
        }
        if (data.quantity === undefined || data.quantity === null) {
            return {
                status: "ERR",
                message: "Số lượng là bắt buộc",
            };
        }
        const checkProduct = await Product.findOne({ _id: data.productId });
        if (!checkProduct) {
            return {
                status: "ERR",
                message: "Không tìm thấy sản phẩm này",
            };
        }
        const stockImportData = {
            productId: data.productId,
            quantity: data.quantity,
            importDay: data.importDay || Date.now(),
            description: data.description,
        };
        const stockImport = await StockImport.create(stockImportData);
        await Product.updateOne(
            { _id: stockImportData.productId },
            { $inc: { countInStock: data.quantity } }
        );

        return {
            status: "success",
            message: "Nhập hàng thành công",
            data: stockImport,
        };
    } catch (error) {
        return {
            status: "ERR",
            message: error.message || "Có lỗi xảy ra khi nhập kho",
        };
    }
};

const getAll = async (data) => {
    try {
        const allStockImport = await StockImport.find().populate("productId", [
            "name"
        ]);
        if (!allStockImport) {
            return {
                status: "ERR",
                message: "Không tìm thấy lịch sử nhập hàng",
            };
        }
        return {
            status: "success",
            message: "Lấy danh sách nhập hàng thành công",
            data: allStockImport,
        };
    } catch (error) {
        return {
            status: "ERR",
            message: error.message || "Có lỗi xảy ra khi nhập kho",
        };
    }
};


export default {
    create, getAll
};