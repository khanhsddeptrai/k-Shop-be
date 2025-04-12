import categoryService from "../services/categoryService.js";

const createCategory = async (req, res) => {
    try {
        const { name, image, description } = req.body;
        if (!name) {
            return res.status(400).json({
                status: "ERR",
                message: "Vui lòng nhập đầy đủ thông tin"
            })
        }
        const respone = await categoryService.create(req.body);
        return res.status(200).json(respone)
    } catch (error) {
        return res.status(404).json({
            message: error
        })
    }
}

const getAllCategory = async (req, res) => {
    try {
        const respone = await categoryService.getAll();
        return res.status(200).json(respone)
    } catch (error) {
        return res.status(404).json({
            message: error
        })
    }
}

const updateCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const data = req.body;
        if (!categoryId) {
            return res.status(400).json({
                status: "Lỗi!",
                message: "Không tìm loại sản phẩm này"
            })
        }
        const respone = await categoryService.update(categoryId, data)
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

const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        if (!categoryId) {
            return res.status(400).json({
                status: "Lỗi!",
                message: "Không tìm thấy thông tin người dùng"
            })
        }
        const respone = await categoryService.deleteACategory(categoryId)
        return res.status(200).json({
            status: respone.status,
            message: respone.message,
        })
    } catch (error) {
        return res.status(404).json({
            message: error
        })
    }
}

export default {
    createCategory, updateCategory, deleteCategory, getAllCategory
};