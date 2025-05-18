import express from 'express';
import axios from 'axios';

const router = express.Router();

const PAYPAL_CLIENT_ID = 'AV4f-CS8wNYzUhhfpVNkWPHSE234ZnduCTXn9OCiGyAXeK2NGHBle0DjQ_j3a1CcWa0C-QnmNWPGNv37'; // Client ID Sandbox
const PAYPAL_CLIENT_SECRET = 'EGfO5gXScDzfZ40pUh2NGog6hWYJ-x_mAH7eXWo5tZMjVmDKt9Fea1_nofUMyMwPVKe8m8oBx7DbNe05'; // Thay bằng Secret Key của bạn
const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // Sandbox, thay bằng api-m.paypal.com cho Live

// Tạo đơn hàng PayPal
router.post('/create-order', async (req, res) => {
    const { items, totalPrice, orderId } = req.body;

    try {
        // Lấy access token
        const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
        const { data: { access_token } } = await axios.post(
            `${PAYPAL_API}/v1/oauth2/token`,
            'grant_type=client_credentials',
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        // Tạo đơn hàng
        const orderResponse = await axios.post(
            `${PAYPAL_API}/v2/checkout/orders`,
            {
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        reference_id: orderId,
                        amount: {
                            currency_code: 'USD', // PayPal không hỗ trợ VND, dùng USD
                            value: (totalPrice / 23000).toFixed(2), // Chuyển VND sang USD (tỷ giá ước tính)
                        },
                        description: `Thanh toán đơn hàng ${orderId}`,
                    },
                ],
                application_context: {
                    return_url: `http://localhost:3000/payment-result`,
                    cancel_url: `http://localhost:3000/checkout`,
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const approveLink = orderResponse.data.links.find(link => link.rel === 'approve').href;
        res.json({ orderId: orderResponse.data.id, approveUrl: approveLink });
    } catch (error) {
        console.error('PayPal create order error:', error.response?.data || error.message);
        res.status(500).json({ status: 'ERR', message: 'Lỗi khi tạo đơn hàng PayPal' });
    }
});

// Xác nhận thanh toán
router.post('/capture-order', async (req, res) => {
    const { orderId } = req.body;

    try {
        const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
        const { data: { access_token } } = await axios.post(
            `${PAYPAL_API}/v1/oauth2/token`,
            'grant_type=client_credentials',
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        const captureResponse = await axios.post(
            `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (captureResponse.data.status === 'COMPLETED') {
            res.json({
                status: 'success',
                orderId: captureResponse.data.purchase_units[0].reference_id,
                transactionId: captureResponse.data.id,
            });
        } else {
            res.json({ status: 'ERR', message: 'Thanh toán không hoàn tất' });
        }
    } catch (error) {
        console.error('PayPal capture error:', error.response?.data || error.message);
        res.status(500).json({ status: 'ERR', message: 'Lỗi khi xác nhận thanh toán' });
    }
});

export default router;