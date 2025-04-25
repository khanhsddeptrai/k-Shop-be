import express from 'express';
const router = express.Router();
import voucherController from '../controllers/voucherController.js';

router.post('/create', voucherController.createVoucher);
router.get('/get-all', voucherController.getAll);
router.put('/update/:id', voucherController.updateVoucher);
router.delete('/delete/:id', voucherController.deleteVoucher);
router.get('/apply/:code', voucherController.applyVoucher);
export default router;