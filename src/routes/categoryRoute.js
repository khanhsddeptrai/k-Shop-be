import express from 'express';
const router = express.Router();
import categoryController from '../controllers/categoryController.js';

router.post('/create', categoryController.createCategory);
router.get('/getAll', categoryController.getAllCategory);
router.put('/update/:id', categoryController.updateCategory);
router.delete('/delete/:id', categoryController.deleteCategory);

export default router;