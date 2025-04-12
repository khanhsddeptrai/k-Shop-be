import express from 'express';
const router = express.Router();
import stockImportController from '../controllers/stockImportController.js';

router.post('/create', stockImportController.createStockImport);
router.get('/get-all', stockImportController.getAllStockImport);


export default router;