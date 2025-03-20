import express from 'express';
const router = express.Router();
import productController from '../controllers/productController.js';

import { authMiddleware, authUserMiddleware } from '../middleware/authMiddleware.js';

router.post('/create', productController.createProduct);
router.get('/getAll', productController.getAllProduct);
router.get('/details/:id', authMiddleware, productController.getDetailsProduct);
router.put('/update/:id', authUserMiddleware, productController.updateProduct);
router.delete('/delete/:id', productController.deleteProduct);


export default router;