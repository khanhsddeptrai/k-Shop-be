import Product from "../models/ProductModel.js";
import Category from "../models/CategoryModel.js";
import natural from "natural";

export const computeTfIdfVector = async (text, allProducts) => {
    const tfidf = new natural.TfIdf();
    tfidf.addDocument(text); // Thêm văn bản hiện tại
    allProducts.forEach(product => tfidf.addDocument(`${product.name} ${product.description || ''}`.toLowerCase()));

    const vector = [];
    tfidf.tfidfs(text, (i, measure) => {
        if (i === 0) vector.push(measure);
    });
    return vector;
};

const create = async (newProduct) => {
    const { name, image, category, price, disscount, countInStock, description } = newProduct;
    try {
        const checkProduct = await Product.findOne({ name });
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

        // Tính TF-IDF vector
        const allProducts = await Product.find().lean();
        const text = `${name} ${description || ''}`.toLowerCase();
        const tfidfVector = await computeTfIdfVector(text, allProducts);

        const product = await Product.create({
            name, image, category, price, disscount, countInStock, description, tfidfVector
        });

        return {
            status: "success",
            message: "Thêm mới sản phẩm thành công",
            data: product
        };
    } catch (error) {
        console.error(error);
        return {
            status: "ERR",
            message: "Lỗi khi tạo sản phẩm: " + error.message
        };
    }
};

const update = async (id, data) => {
    try {
        const checkProduct = await Product.findById(id);
        if (!checkProduct) {
            return {
                status: "ERR",
                message: "Không tìm thấy sản phẩm này",
            };
        }
        if (data.category) {
            const checkCategory = await Category.findById(data.category);
            if (!checkCategory) {
                return {
                    status: "ERR",
                    message: "Không tìm thấy loại sản phẩm này",
                };
            }
        }

        // Tính lại TF-IDF vector nếu name hoặc description thay đổi
        if (data.name || data.description) {
            const allProducts = await Product.find({ _id: { $ne: id } }).lean();
            const text = `${data.name || checkProduct.name} ${data.description || checkProduct.description || ''}`.toLowerCase();
            data.tfidfVector = await computeTfIdfVector(text, allProducts);
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, data, { new: true }).populate('category');

        return {
            status: "success",
            message: "Cập nhật sản phẩm thành công",
            data: updatedProduct
        };
    } catch (error) {
        console.error(error);
        return {
            status: "ERR",
            message: "Lỗi khi cập nhật sản phẩm: " + error.message
        };
    }
};

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
                throw new Error('Danh mục không tồn tại: ' + categoryId);
            }
            query.where('category').equals(categoryId);
        }

        // Xử lý sort
        if (sort) {
            query.sort({ [sort[1]]: sort[0] });
        }

        // Xử lý filter (nếu có)
        if (filter) {
            let filterField, filterValue;

            // Nếu filter là chuỗi (ví dụ: "name:áo thun")
            if (typeof filter === 'string') {
                const [field, value] = filter.split(':');
                if (!field || !value) {
                    throw new Error('Định dạng filter không hợp lệ: ' + filter);
                }
                filterField = field;
                filterValue = value;
            }
            // Nếu filter là mảng (ví dụ: ["name", "áo thun"])
            else if (Array.isArray(filter) && filter[0] && filter[1]) {
                filterField = filter[0];
                filterValue = filter[1];
            } else {
                throw new Error('Định dạng filter không hợp lệ: ' + filter);
            }

            switch (filterField) {
                case 'category':
                    const category = await Category.findOne({ name: filterValue });
                    if (category) {
                        query.where('category').equals(category._id);
                    } else {
                        throw new Error('Không tìm thấy danh mục: ' + filterValue);
                    }
                    break;
                case 'name':
                    query.where('name').regex(new RegExp(filterValue, 'i'));
                    break;
                case 'price':
                    if (!isNaN(filterValue)) {
                        query.where('price').equals(Number(filterValue));
                    } else if (filterValue.includes('-')) {
                        const [min, max] = filterValue.split('-').map(Number);
                        if (isNaN(min) || isNaN(max)) {
                            throw new Error('Giá trị price không hợp lệ: ' + filterValue);
                        }
                        query.where('price').gte(min).lte(max);
                    } else {
                        throw new Error('Giá trị price không hợp lệ: ' + filterValue);
                    }
                    break;
                default:
                    throw new Error('Trường lọc không được hỗ trợ: ' + filterField);
            }
        }

        // Tổng số sản phẩm (sau khi áp dụng filter)
        const totalProduct = await Product.countDocuments(query.getFilter());

        // Thực thi query
        const products = await query.populate('category').exec();

        const response = {
            status: 'Thành công',
            message: products.length > 0 ? 'Lấy danh sách sản phẩm thành công' : 'Không có sản phẩm nào',
            data: products,
            totalProduct,
            currentPage: Number(page) || 1,
            totalPage: limit ? Math.ceil(totalProduct / limit) : 1,
        };

        return response;
    } catch (error) {
        throw new Error('Lỗi khi lấy danh sách sản phẩm: ' + error.message);
    }
};

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

const getProductSuggest = async ({ search = '', limit = 5 }) => {
    try {
        const query = search
            ? { name: { $regex: search, $options: 'i' } } // Tìm kiếm không phân biệt hoa thường
            : {};
        const products = await Product.find(query)
            .select('_id name image price') // Chỉ lấy các trường cần thiết
            .limit(parseInt(limit)) // Giới hạn số lượng kết quả
            .lean(); // Chuyển đổi sang plain JavaScript object để tối ưu hiệu suất
        return {
            status: 'success',
            data: products,
            total: products.length,
        };
    } catch (error) {
        console.error('Error in searchProductSuggestions:', error);
        throw new Error('Failed to fetch product suggestions');
    }
}

const getProductsByCategoryId = async ({ categoryId, limit, excludeId }) => {
    try {
        const checkCategory = await Category.findById(categoryId);
        if (!checkCategory) {
            return {
                status: "ERR",
                message: "Danh mục không tồn tại trong hệ thống",
            };
        }
        const query = { category: categoryId };
        if (excludeId) {
            query._id = { $ne: excludeId }; // Loại bỏ sản phẩm có ID trùng
        }

        const products = await Product.find(query)
            .limit(parseInt(limit))
            .lean(); // Chuyển sang plain JavaScript object để tối ưu

        return {
            status: "success",
            message: products.length > 0 ? "Lấy danh sách sản phẩm gợi ý thành công" : "Không có sản phẩm gợi ý",
            data: products,
        };
    } catch (error) {
        console.error("Error in getProductsByCategory:", error);
        return {
            status: "ERR",
            message: "Lỗi khi lấy danh sách sản phẩm gợi ý: " + error.message,
        };
    }
};

// Hàm cập nhật: Tìm sản phẩm tương đồng sử dụng TF-IDF và cosine similarity với vector đã lưu
const getSimilarProducts = async ({ productId, limit = 4 }) => {
    try {
        // Lấy sản phẩm hiện tại
        const currentProduct = await Product.findById(productId).lean();
        if (!currentProduct) {
            return {
                status: "ERR",
                message: "Sản phẩm không tồn tại",
            };
        }

        // Lấy tất cả sản phẩm khác có tfidfVector
        const allProducts = await Product.find({ _id: { $ne: productId }, tfidfVector: { $exists: true } }).lean();
        if (!allProducts.length) {
            return {
                status: "success",
                message: "Không có sản phẩm tương đồng",
                data: [],
            };
        }

        // Tính cosine similarity giữa vector của sản phẩm hiện tại và các sản phẩm khác
        const similarities = allProducts.map(product => {
            const vector1 = currentProduct.tfidfVector || [];
            const vector2 = product.tfidfVector || [];

            const dotProduct = vector1.reduce((sum, v, i) => sum + v * (vector2[i] || 0), 0);
            const magnitude1 = Math.sqrt(vector1.reduce((sum, v) => sum + v * v, 0));
            const magnitude2 = Math.sqrt(vector2.reduce((sum, v) => sum + v * v, 0));
            const similarity = magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0;

            return { id: product._id, similarity };
        });

        // Sắp xếp theo độ tương đồng và lấy top limit sản phẩm
        const similarProductIds = similarities
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, parseInt(limit))
            .map(item => item.id);

        const similarProducts = await Product.find({ _id: { $in: similarProductIds } }).lean();

        return {
            status: "success",
            message: similarProducts.length > 0 ? "Lấy danh sách sản phẩm tương đồng thành công" : "Không có sản phẩm tương đồng",
            data: similarProducts,
        };
    } catch (error) {
        console.error("Error in getSimilarProducts:", error);
        return {
            status: "ERR",
            message: "Lỗi khi lấy danh sách sản phẩm tương đồng: " + error.message,
        };
    }
};

export default {
    create, update, getAll, getDetails, deleteAProduct,
    deleteMany, getProductSuggest, getProductsByCategoryId, getSimilarProducts
};