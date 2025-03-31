import express from 'express';
const router = express.Router();
import roleController from '../controllers/roleController.js';

router.get('/getAll', roleController.getAllRole);
router.put('/update/:id', roleController.updateRole);


export default router;