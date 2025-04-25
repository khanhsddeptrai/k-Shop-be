import Order from "../models/OrdersModel.js";
import Product from "../models/ProductModel.js";

const create = async (orderData) => {
    try {
        const {
            user,
            orderItems,
            shippingAddress,
            shippingCost = 0,
            totalPrice,
            paymentMethod,
            voucherId,
            isPaid = false,
            isDelivered = false,
            status = "pending",
        } = orderData;

        if (!user || !orderItems || !shippingAddress || !totalPrice || !paymentMethod) {
            return {
                status: "ERR",
                message: "Thiếu các trường bắt buộc: user, orderItems, shippingAddress, totalPrice, paymentMethod",
            };
        }

        if (!Array.isArray(orderItems) || orderItems.length === 0) {
            return {
                status: "ERR",
                message: "orderItems phải là một mảng và không được rỗng",
            };
        }

        for (const item of orderItems) {
            const { name, quantity, image, price, product } = item;
            if (!name || !quantity || !image || !price || !product) {
                return {
                    status: "ERR",
                    message: "Mỗi mục trong orderItems phải chứa đầy đủ: name, quantity, image, price, product",
                };
            }
            if (quantity <= 0 || price < 0) {
                return {
                    status: "ERR",
                    message: "quantity phải lớn hơn 0 và price không được nhỏ hơn 0",
                };
            }

            // Kiểm tra số lượng tồn kho của sản phẩm
            const productData = await Product.findById(product);
            if (!productData) {
                return {
                    status: "ERR",
                    message: `Sản phẩm với ID ${product} không tồn tại`,
                };
            }
            if (productData.countInStock < quantity) {
                return {
                    status: "ERR",
                    message: `Sản phẩm ${name} không đủ số lượng tồn kho (còn ${productData.quantity})`,
                };
            }
        }

        const { name, address, phone, city, location } = shippingAddress;
        if (!name || !address || !phone || !city) {
            return {
                status: "ERR",
                message: "shippingAddress phải chứa đầy đủ: name, address, phone, city",
            };
        }

        if (totalPrice < 0) {
            return {
                status: "ERR",
                message: "totalPrice không được nhỏ hơn 0",
            };
        }

        if (!["COD", "BankTransfer", "MoMo"].includes(paymentMethod)) {
            return {
                status: "ERR",
                message: "paymentMethod không hợp lệ",
            };
        }

        // Tạo đơn hàng
        const newOrder = await Order.create({
            user,
            orderItems,
            shippingAddress: {
                name: name.trim(),
                address: address.trim(),
                phone: phone.trim(),
                city: city.trim(),
                location: location || { latitude: 0, longitude: 0 },
            },
            shippingCost,
            totalPrice,
            paymentMethod,
            voucherId: voucherId || null,
            isPaid,
            paidAt: isPaid ? new Date() : null,
            isDelivered,
            deliveredAt: isDelivered ? new Date() : null,
            status,
        });

        // Giảm số lượng tồn kho cho mỗi sản phẩm trong orderItems
        for (const item of orderItems) {
            const { product, quantity } = item;
            await Product.findByIdAndUpdate(
                product,
                { $inc: { countInStock: -quantity } }, // Giảm số lượng đi quantity
                { new: true }
            );
        }

        return {
            status: "success",
            message: "Tạo đơn hàng thành công",
            data: newOrder,
        };
    } catch (error) {
        console.error("Lỗi khi tạo đơn hàng:", error);
        return {
            status: "ERR",
            message: "Lỗi khi tạo đơn hàng: " + error.message,
        };
    }
};

const getOrdersByUserId = async (userId) => {
    try {
        const orders = await Order.find({ user: userId }).populate("user", "name email");
        if (!orders || orders.length === 0) {
            return {
                status: "ERR",
                message: "Không tìm thấy đơn hàng nào của người dùng này",
            };
        }
        return {
            status: "success",
            message: "Lấy danh sách đơn hàng thành công",
            data: orders,
        };
    } catch (error) {
        return {
            status: "ERR",
            message: "Lỗi khi lấy danh sách đơn hàng: " + error.message,
        };
    }
};

const getAll = async () => {
    try {
        const orders = await Order.find().populate("user", "email");
        if (!orders || orders.length === 0) {
            return {
                status: "ERR",
                message: "Không có đơn hàng",
            };
        }
        const totalOrders = await Order.countDocuments();
        return {
            status: "success",
            message: "Lấy danh sách đơn hàng thành công",
            data: orders,
            totalOrders: totalOrders
        };
    } catch (error) {
        return {
            status: "ERR",
            message: "Lỗi khi lấy danh sách đơn hàng: " + error.message,
        };
    }
};

const getDetail = async (id) => {
    try {
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return {
                status: "ERR",
                message: "ID đơn hàng không hợp lệ",
            };
        }
        const order = await Order.findOne({ _id: id }).populate("user", "name email");

        if (!order) {
            return {
                status: "ERR",
                message: "Không tìm thấy đơn hàng này",
            };
        }
        return {
            status: "success",
            message: "Lấy đơn hàng thành công",
            data: order, // Trả về đối tượng đơn hàng, không phải mảng
        };
    } catch (error) {
        return {
            status: "ERR",
            message: `Lỗi khi lấy đơn hàng: ${error.message}`,
        };
    }
};

const updateStatus = async (id, status) => {
    try {
        const checkOrder = await Order.findOne({
            _id: id
        });
        if (checkOrder === null) {
            return {
                status: "ERR",
                message: "Không tìm thấy đơn hàng này",
            };
        }
        const currentStatus = checkOrder.status;
        const newStatus = status.status;
        if (currentStatus === 'pending') {
            if (newStatus !== 'confirmed' && newStatus !== 'cancelled') {
                return {
                    status: "ERR",
                    message: "Đơn hàng đang chờ xử lý chỉ có thể được chấp nhận hoặc từ chối",
                };
            }
        } else if (currentStatus === 'confirmed') {
            if (newStatus !== 'delivered') {
                return {
                    status: "ERR",
                    message: "Đơn hàng đã xác nhận chỉ có thể chuyển sang đã giao",
                };
            }
        } else {
            return {
                status: "ERR",
                message: "Không thể cập nhật trạng thái cho đơn hàng này",
            };
        }

        const updatedOrder = await Order.findByIdAndUpdate(id, { status: newStatus }, { new: true });
        return {
            status: "success",
            message: "Cập nhật trạng thái đơn hàng thành công",
            data: updatedOrder,
        };
    } catch (error) {
        return {
            status: "ERR",
            message: error.message,
        };
    }
};
export default {
    create, getOrdersByUserId, getDetail, getAll, updateStatus
};