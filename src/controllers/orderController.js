import orderService from "../services/orderService.js";

const createOrder = async (req, res) => {
    try {
        const {
            user,
            orderItems,
            shippingAddress,
            shippingCost,
            totalPrice,
            paymentMethod,
            voucherId,
            paymentStatus,
        } = req.body;

        // Kiểm tra các trường bắt buộc
        if (!user || !orderItems || !shippingAddress || !totalPrice || !paymentMethod) {
            return res.status(400).json({
                status: "ERR",
                message: "Vui lòng nhập đầy đủ thông tin bắt buộc",
            });
        }
        // Kiểm tra orderItems có ít nhất 1 sản phẩm
        if (!Array.isArray(orderItems) || orderItems.length === 0) {
            return res.status(400).json({
                status: "ERR",
                message: "orderItems phải là một mảng và không được rỗng",
            });
        }
        // Kiểm tra các trường bắt buộc trong shippingAddress
        const { name, address, phone, city } = shippingAddress;
        if (!name || !address || !phone || !city) {
            return res.status(400).json({
                status: "ERR",
                message: "shippingAddress phải chứa đầy đủ các trường: name, address, phone, city",
            });
        }

        // Gọi service để tạo đơn hàng
        const response = await orderService.create(req.body);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error.message || "Lỗi server khi tạo đơn hàng",
        });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const userId = req.params.userId;
        const response = await orderService.getOrdersByUserId(userId);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            status: "Lỗi",
            message: error.message
        });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const response = await orderService.getAll();
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error.message
        });
    }
};

const getOrderDetail = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await orderService.getDetail(id);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error.message
        });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const orderStatus = req.body;
        const response = await orderService.updateStatus(id, orderStatus);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error.message
        });
    }
};

const updatePaymentStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { paymentStatus } = req.body;
        const response = await orderService.updatePaymentStatus(id, paymentStatus);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error.message,
        });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await orderService.deleteAOrder(id);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            status: "ERR",
            message: error.message || "Lỗi server khi xóa đơn hàng",
        });
    }
};
export default {
    createOrder, getMyOrders, getOrderDetail, getAllOrders, updateOrderStatus,
    updatePaymentStatus, deleteOrder
};