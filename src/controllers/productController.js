import mongoose from "mongoose";
import productService from "../services/productService.js";

const createProduct = async (req, res) => {
    try {
        const { name, image, category, price, disscount, countInStock, description } = req.body;
        if (!name || !image || !price) {
            return res.status(200).json({
                status: "ERR",
                message: "Vui lòng nhập đầy đủ thông tin"
            })
        }
        const respone = await productService.create(req.body);
        return res.status(200).json(respone)
    } catch (error) {
        return res.status(404).json({
            message: error
        })
    }
}

const getAllProduct = async (req, res) => {
    const { page, limit, sort, filter, categoryId } = req.query;
    const pageNum = !isNaN(+page) && +page > 0 ? +page : 1;
    const limitNum = !isNaN(+limit) && +limit > 0 ? +limit : 4;

    try {
        const response = await productService.getAll(limitNum, pageNum, sort, filter, categoryId);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            status: "Lỗi",
            message: error.message
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const data = req.body;
        if (!productId) {
            return res.status(200).json({
                status: "Lỗi!",
                message: "Không tìm thấy sản phẩm này"
            })
        }
        const respone = await productService.update(productId, data)
        return res.status(200).json({
            status: respone.status,
            message: respone.message,
            data: respone.data
        })
    } catch (error) {
        return res.status(404).json({
            message: error
        })
    }
}

const getDetailsProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                status: "Lỗi",
                message: "productId không đúng định dạng ObjectId"
            });
        }
        const respone = await productService.getDetails(productId)
        return res.status(200).json({
            status: respone.status,
            message: respone.message,
            data: respone.data
        })
    } catch (error) {
        return res.status(404).json({
            message: error
        })
    }
}

const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                status: "Lỗi",
                message: "productId không đúng định dạng ObjectId"
            });
        }
        const respone = await productService.deleteAProduct(productId)
        return res.status(200).json({
            status: respone.status,
            message: respone.message,
            data: respone.data
        })
    } catch (error) {
        return res.status(404).json({
            message: error
        })
    }
}

const deleteManyProduct = async (req, res) => {
    try {
        const productIds = req.body
        if (!productIds) {
            return res.status(400).json({
                status: "ERR",
                message: "Danh sách id là bắt buộc"
            });
        }
        // if (!mongoose.Types.ObjectId.isValid(productId)) {
        //     return res.status(400).json({
        //         status: "Lỗi",
        //         message: "productId không đúng định dạng ObjectId"
        //     });
        // }
        const respone = await productService.deleteMany(productIds)
        return res.status(200).json({
            status: respone.status,
            message: respone.message,
            data: respone.data
        })
    } catch (error) {
        return res.status(404).json({
            message: error
        })
    }
}

const getProductSuggestion = async (req, res) => {
    try {
        const { search, limit } = req.query; // Lấy tham số từ query string
        const result = await productService.getProductSuggest({ search, limit });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Internal server error',
        });
    }
}

export default {
    createProduct, getAllProduct, updateProduct, getDetailsProduct,
    deleteProduct, deleteManyProduct, getProductSuggestion
};