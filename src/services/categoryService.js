import Category from '../models/CategoryModel.js';

const create = async (newCategory) => {
    const { name, image, description } = newCategory;
    try {
        const checkCategory = await Category.findOne({
            name: name
        })
        if (checkCategory !== null) {
            return {
                status: "Lỗi",
                message: "Loại sản phẩm này đã tồn tại"
            };
        }
        const category = await Category.create({
            name, image, description
        })

        if (category) {
            return {
                status: "Thành công",
                message: "Thêm loại sản phẩm mới thành công",
                data: category
            };
        }

    } catch (error) {
        console.log(error);
    }
}

const getAll = async () => {
    try {
        const categories = await Category.find()
        if (categories) {
            return {
                status: "Thành công",
                message: "Lấy danh sách loại sản phẩm thành công",
                data: categories
            };
        }

    } catch (error) {
        console.log(error);
    }
}


const update = async (id, data) => {
    try {
        const checkCategory = await Category.findOne({
            _id: id
        })
        if (checkCategory === null) {
            return {
                status: "Lỗi",
                message: "Không tìm thấy loại sản phẩm này",
            }
        }

        const updatedCategory = await Category.findByIdAndUpdate(id, data, { new: true })
        console.log("updateed category: ", updatedCategory)

        return {
            status: "Thành công",
            message: "Cập nhật loại sản phẩm thành công",
            data: updatedCategory
        }

    } catch (error) {
        console.log(error);
    }
}

const deleteACategory = async (id) => {
    try {
        const checkCategory = await Category.findOne({
            _id: id
        })
        if (checkCategory === null) {
            return {
                status: "Lỗi",
                message: "Không tìm thấy loại sản phẩm này",
            }
        }
        await Category.findByIdAndDelete(id)
        return {
            status: "Thành công",
            message: "Xóa loại sản phẩm thành công",
        }

    } catch (error) {
        console.log(error);
    }
}

export default {
    create, update, deleteACategory, getAll

};