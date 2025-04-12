import Category from '../models/CategoryModel.js';

const create = async (newCategory) => {
    const { name, image, description } = newCategory;
    try {
        const normalizedName = name ? name.trim() : '';
        if (!normalizedName) {
            return {
                status: "ERR",
                message: "Tên danh mục không được để trống",
            };
        }
        // Kiểm tra tên danh mục trùng lặp (không phân biệt hoa/thường)
        const checkCategory = await Category.findOne({
            name: { $regex: `^${normalizedName}$`, $options: 'i' }, // Tìm kiếm không phân biệt hoa/thường
        });
        if (checkCategory) {
            return {
                status: "ERR",
                message: "Tên danh mục này đã tồn tại trong hệ thống",
            };
        }
        const category = await Category.create({
            name: normalizedName,
            image,
            description,
        });
        return {
            status: "success",
            message: "Thêm loại sản phẩm mới thành công",
            data: category,
        };
    } catch (error) {
        console.error("Lỗi khi tạo danh mục:", error);
        return {
            status: "ERR",
            message: "Lỗi khi tạo danh mục: " + error.message,
        };
    }
};

const getAll = async (limit, page, sort, filter) => {
    try {
        const totalCategory = await Category.countDocuments();
        const query = Category.find();
        if (limit && page) {
            query.limit(limit).skip((page - 1) * limit);
        }
        if (sort && sort[0] && sort[1]) {
            query.sort({ [sort[1]]: sort[0] });
        }
        if (filter && filter[0] && filter[1]) {
            switch (filter[0]) {
                case "name":
                    query.where('name').regex(new RegExp(filter[1], 'i'));
                    break;
                case "slug":
                    query.where('slug').regex(new RegExp(filter[1], 'i'));
                    break;
                case "_id":
                    query.where('_id').equals(filter[1]);
                    break;

                default:
                    throw new Error("Trường lọc không được hỗ trợ: " + filter[0]);
            }
        }
        const categories = await query.exec();
        const response = {
            status: "success",
            message: categories.length > 0 ? "Lấy danh sách danh mục thành công" : "Không có danh mục nào",
            data: categories,
            totalCategory,
            currentPage: limit && page ? Number(page) : 1,
            totalPage: limit && page ? Math.ceil(totalCategory / limit) : 1
        };
        return response;
    } catch (error) {
        throw new Error("Lỗi khi lấy danh sách danh mục: " + error.message);
    }
};


const update = async (id, data) => {
    try {
        const checkCategory = await Category.findOne({ _id: id });
        if (!checkCategory) {
            return {
                status: "ERR",
                message: "Không tìm thấy loại sản phẩm này",
            };
        }
        const normalizedName = data.name ? data.name.trim() : '';
        if (!normalizedName) {
            return {
                status: "ERR",
                message: "Tên danh mục không được để trống",
            };
        }
        if (normalizedName) {
            const existingCategory = await Category.findOne({
                name: { $regex: `^${normalizedName}$`, $options: 'i' }, // Tìm kiếm không phân biệt hoa/thường
                _id: { $ne: id }, // Loại trừ danh mục hiện tại
            });
            if (existingCategory) {
                return {
                    status: "ERR",
                    message: "Tên danh mục này đã tồn tại trong hệ thống",
                };
            }
        }
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { ...data, name: normalizedName }, // Lưu tên đã chuẩn hóa
            { new: true }
        );
        return {
            status: "success",
            message: "Cập nhật loại sản phẩm thành công",
            data: updatedCategory,
        };
    } catch (error) {
        console.error("Lỗi khi cập nhật danh mục:", error);
        return {
            status: "ERR",
            message: "Lỗi khi cập nhật danh mục: " + error.message,
        };
    }
};

const deleteACategory = async (id) => {
    try {
        const checkCategory = await Category.findOne({
            _id: id
        })
        if (checkCategory === null) {
            return {
                status: "ERR",
                message: "Không tìm thấy loại sản phẩm này",
            }
        }
        await Category.findByIdAndDelete(id)
        return {
            status: "success",
            message: "Xóa loại sản phẩm thành công",
        }

    } catch (error) {
        console.log(error);
    }
}

export default {
    create, update, deleteACategory, getAll

};