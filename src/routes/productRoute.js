import express from 'express';
const router = express.Router();
import productController from '../controllers/productController.js';

import { authMiddleware, authUserMiddleware } from '../middleware/authMiddleware.js';

router.post('/create', productController.createProduct);
router.get('/getAll', productController.getAllProduct);
router.get('/detail/:id', productController.getDetailsProduct);
router.put('/update/:id', authMiddleware, productController.updateProduct);
router.delete('/delete/:id', productController.deleteProduct);
router.delete('/delete-many', authMiddleware, productController.deleteManyProduct);
router.get('/search-suggestion', productController.getProductSuggestion);
router.get("/same-category", productController.getProductsByCategory);
router.get("/similar-products", productController.getSimilarProducts);

export default router;