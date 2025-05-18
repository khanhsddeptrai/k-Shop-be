import Product from "../models/ProductModel.js";
import Category from "../models/CategoryModel.js";
import natural from "natural";

const stopWords = [
    'là', 'với', 'của', 'cho', 'trong', 'và', 'hoặc', 'tại', 'the', 'and', 'or', 'in', 'on', 'at', 'to'
];

export const computeTfIdfVector = async (text, allProducts) => {
    try {
        if (!text || text.trim().length < 3) {
            console.warn('Text is too short or empty');
            return [];
        }

        const tfidf = new natural.TfIdf();
        tfidf.stopwords = stopWords; // Thêm từ dừng

        // Thêm tài liệu
        tfidf.addDocument(text.toLowerCase());
        allProducts.forEach(product => {
            const productText = `${product.name} ${product.description || ''}`.toLowerCase();
            tfidf.addDocument(productText);
        });

        // Xây dựng từ điển từ các tài liệu
        const vocabulary = [];
        tfidf.listTerms(0).forEach(term => {
            if (!vocabulary.includes(term.term)) {
                vocabulary.push(term.term);
            }
        });

        // Tạo vector TF-IDF
        const vector = new Array(vocabulary.length).fill(0);
        tfidf.listTerms(0).forEach(term => {
            const index = vocabulary.indexOf(term.term);
            if (index !== -1) {
                vector[index] = term.tfidf;
            }
        });

        return vector;
    } catch (error) {
        console.error('Error computing TF-IDF vector:', error);
        return [];
    }
};

const create = async (newProduct) => {
    const { name, image, category, price, discount, countInStock, description } = newProduct;
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
        const allProducts = await Product.find().limit(100).lean(); // Giới hạn số sản phẩm
        const text = `${name} ${description || ''}`.toLowerCase();
        const tfidfVector = await computeTfIdfVector(text, allProducts);

        const product = await Product.create({
            name, image, category, price, discount, countInStock, description, tfidfVector
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
            const allProducts = await Product.find({ _id: { $ne: id } }).limit(100).lean();
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
    const threshold = 0.6; // Ngưỡng cố định
    const MAX_PRODUCTS = 100; // Giới hạn số sản phẩm tải

    try {
        const currentProduct = await Product.findById(productId).lean();
        if (!currentProduct) {
            return {
                status: "ERR",
                message: "Sản phẩm không tồn tại",
            };
        }

        const currentName = currentProduct.name.toLowerCase();
        const keywords = currentName.split(' ')
            .filter(word => word.length > 2 && !stopWords.includes(word.toLowerCase()));

        // Bước 1: Lọc sản phẩm có tên chứa từ khóa
        const nameMatchedProducts = await Product.find({
            _id: { $ne: productId },
            name: { $regex: keywords.join('|'), $options: 'i' },
        })
            .limit(MAX_PRODUCTS)
            .lean();

        if (nameMatchedProducts.length === 0) {
            // Fallback về sản phẩm cùng danh mục
            console.log(`No products matched keywords, falling back to category ${currentProduct.category}`);
            const fallbackProducts = await Product.find({
                _id: { $ne: productId },
                category: currentProduct.category
            })
                .sort({ price: 1 }) // Sắp xếp theo giá
                .limit(parseInt(limit))
                .lean();

            return {
                status: "success",
                message: `Không có sản phẩm nào có tên tương tự, fallback về danh mục ${currentProduct.category}`,
                data: fallbackProducts,
            };
        }

        // Bước 2: Tính TF-IDF vector của sản phẩm hiện tại
        const text = `${currentProduct.name} ${currentProduct.description || ''}`.toLowerCase();
        const vector1 = await computeTfIdfVector(text, nameMatchedProducts);

        // Bước 3: Tính độ tương đồng
        const similarities = nameMatchedProducts.map(product => {
            const vector2 = product.tfidfVector || [];
            // Đảm bảo vector có cùng độ dài
            const maxLength = Math.max(vector1.length, vector2.length);
            const v1 = vector1.concat(new Array(maxLength - vector1.length).fill(0));
            const v2 = vector2.concat(new Array(maxLength - vector2.length).fill(0));

            const dotProduct = v1.reduce((sum, v, i) => sum + v * v2[i], 0);
            const magnitude1 = Math.sqrt(v1.reduce((sum, v) => sum + v * v, 0));
            const magnitude2 = Math.sqrt(v2.reduce((sum, v) => sum + v * v, 0));
            const similarity = magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0;

            console.log(`Sản phẩm: ${product.name}, Similarity: ${similarity.toFixed(4)}, Category: ${product.category}`);
            return { id: product._id, similarity };
        });

        // Bước 4: Lọc theo ngưỡng
        const filtered = similarities
            .filter(item => item.similarity >= threshold)
            .sort((a, b) => b.similarity - a.similarity)


        // console.log(`Tổng sản phẩm vượt ngưỡng ${threshold}: ${filtered.length}`);

        // Bước 5: Kiểm tra xem có sản phẩm nào vượt ngưỡng không
        if (filtered.length === 0) {
            console.log(`Không có sản phẩm nào vượt ngưỡng ${threshold}, falling back to category ${currentProduct.category}`);
            const fallbackProducts = await Product.find({
                _id: { $ne: productId },
                category: currentProduct.category
            })
                .sort({ price: 1 })
                .limit(parseInt(limit))
                .lean();

            return {
                status: "success",
                message: `Không có sản phẩm nào vượt ngưỡng ${threshold}, fallback về danh mục ${currentProduct.category}`,
                data: fallbackProducts,
            };
        }

        // Lấy sản phẩm theo danh sách đã lọc
        const similarProductIds = filtered.map(item => item.id);
        const similarProducts = await Product.find({ _id: { $in: similarProductIds } }).lean();

        return {
            status: "success",
            message: `Lấy danh sách sản phẩm tương tự với threshold >= ${threshold} thành công`,
            data: similarProducts,
        };
    } catch (error) {
        console.error("Error in getSimilarProducts:", error);
        return {
            status: "ERR",
            message: "Lỗi khi lấy danh sách sản phẩm tương tự: " + error.message,
        };
    }
};



export default {
    create, update, getAll, getDetails, deleteAProduct,
    deleteMany, getProductSuggest, getProductsByCategoryId, getSimilarProducts
};