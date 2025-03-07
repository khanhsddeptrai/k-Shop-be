import express from 'express';
const router = express.Router();
import userController from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

router.post('/sign-up', userController.create);
router.post('/sign-in', userController.login);
router.put('/update-user/:id', userController.update);
router.delete('/delete-user/:id', authMiddleware, userController.deleteUser);
router.get('/get-all', userController.getAllUser);
router.get('/get-detail/:id', userController.getDetailUser);

export default router;