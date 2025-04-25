import express from 'express';
const router = express.Router();
import orderController from '../controllers/orderController.js';
import { isLoggedIn } from '../middleware/authMiddleware.js';


router.post('/create', isLoggedIn, orderController.createOrder);
router.get('/my-order/:userId', orderController.getMyOrders);
router.get('/get-all', orderController.getAllOrders);
router.get('/detail/:id', orderController.getOrderDetail);
router.put('/change-status/:id', orderController.updateOrderStatus);



export default router;