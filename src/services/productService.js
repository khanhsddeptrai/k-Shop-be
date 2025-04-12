import Product from "../models/ProductModel.js";
import Category from "../models/CategoryModel.js";

const create = async (newProduct) => {
    const { name, image, category, price, disscount, countInStock, description } = newProduct;
    try {
        const checkProduct = await Product.findOne({
            name: name
        })
        if (checkProduct !== null) {
            return {
                status: "Lỗi",
                message: "Sản phẩm này đã tồn tại trong hệ thống"
            };
        }
        const checkCategory = await Category.findById(category);
        if (!checkCategory) {
            return {
                status: "Lỗi",
                message: "Danh mục không tồn tại trong hệ thống"
            };
        }
        const product = await Product.create({
            name, image, category, price, disscount, countInStock, description
        });

        if (product) {
            return {
                status: "success",
                message: "Thêm mới sản phẩm thành công",
                data: product
            };
        }

    } catch (error) {
        console.log(error);
    }
}

const getAll = async (limit, page, sort, filter, categoryId) => {
    try {
        const query = Product.find();

        // Phân trang
        if (limit && page) {
            query.limit(limit).skip((page - 1) * limit);
        }

        // Lọc theo categoryId nếu có
        if (categoryId) {
            const checkCategory = await Category.findById(categoryId);
            if (!checkCategory) {
                throw new Error("Danh mục không tồn tại: " + categoryId);
            }
            query.where("category").equals(categoryId);
        }

        // Xử lý sort
        if (sort) {
            query.sort({ [sort[1]]: sort[0] });
        }

        // Xử lý filter (nếu cần)
        if (filter && filter[0] && filter[1]) {
            switch (filter[0]) {
                case "category":
                    const category = await Category.findOne({ name: filter[1] });
                    if (category) {
                        query.where("category").equals(category._id);
                    } else {
                        throw new Error("Không tìm thấy danh mục: " + filter[1]);
                    }
                    break;
                case "name":
                    query.where("name").regex(new RegExp(filter[1], "i"));
                    break;
                case "price":
                    if (!isNaN(filter[1])) {
                        query.where("price").equals(Number(filter[1]));
                    } else if (filter[1].includes("-")) {
                        const [min, max] = filter[1].split("-").map(Number);
                        query.where("price").gte(min).lte(max);
                    } else {
                        throw new Error("Giá trị price không hợp lệ: " + filter[1]);
                    }
                    break;
                default:
                    throw new Error("Trường lọc không được hỗ trợ: " + filter[0]);
            }
        }

        // Tổng số sản phẩm (sau khi áp dụng filter)
        const totalProduct = await Product.countDocuments(query.getFilter());

        // Thực thi query
        const products = await query.populate("category").exec();

        const response = {
            status: "Thành công",
            message: products.length > 0 ? "Lấy danh sách sản phẩm thành công" : "Không có sản phẩm nào",
            data: products,
            totalProduct,
            currentPage: Number(page) || 1,
            totalPage: limit ? Math.ceil(totalProduct / limit) : 1,
        };

        return response;
    } catch (error) {
        throw new Error("Lỗi khi lấy danh sách sản phẩm: " + error.message);
    }
};

const update = async (id, data) => {
    try {
        const checkProduct = await Product.findOne({
            _id: id
        })
        if (checkProduct === null) {
            return {
                status: "ERR",
                message: "Không tìm thấy  sản phẩm này",
            }
        }
        if (data.category) {
            const checkCategory = await Category.findById(data.category);
            if (checkCategory === null) {
                return {
                    status: "ERR",
                    message: "Không tìm thấy loại sản phẩm này",
                }
            }
        }
        const updatedProduct = await Product.findByIdAndUpdate(id, data, { new: true }).populate('category')
        console.log("updateed category: ", updatedProduct)

        return {
            status: "success",
            message: "Cập nhật sản phẩm thành công",
            data: updatedProduct
        }

    } catch (error) {
        console.log(error);
    }
}

const getDetails = async (id) => {
    try {
        const product = await Product.findOne({ _id: id }).populate('category')
        if (!product) {
            return {
                status: "Lỗi",
                message: "Không tìm thấy sản phẩm này",
                data: null
            };
        }
        return {
            status: "Thành công",
            message: "Lấy thông tin sản phẩm thành công",
            data: product
        };
    } catch (error) {
        console.log(error);
    }
}

const deleteAProduct = async (id) => {
    try {
        if (!id) {
            return {
                status: "Lỗi!",
                message: "Không tìm thấy sản phẩm này"
            }
        }
        const product = await Product.deleteOne({ _id: id })

        if (product) {
            return {
                status: "success",
                message: "Xóa sản phẩm thành công",
                data: product
            };
        }

    } catch (error) {
        console.log(error);
    }
}

const deleteMany = async (ids) => {
    try {
        const deletedMany = await Product.deleteMany({ _id: { $in: ids } });
        if (deletedMany) {
            return {
                status: "success",
                message: "Xóa sản phẩm thành công",
                data: deletedMany
            };
        }
    } catch (error) {
        console.log(error);
    }
}

export default {
    create, getAll, update, getDetails, deleteAProduct,
    deleteMany

};