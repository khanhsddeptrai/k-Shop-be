import express from 'express';
const router = express.Router();
import userController from '../controllers/userController.js';
import { authMiddleware, authUserMiddleware } from '../middleware/authMiddleware.js';

router.post('/sign-up', userController.signup);
router.post('/sign-in', userController.login);
router.post('/log-out', userController.logout);
router.post('/create', userController.create);
router.put('/update-user/:id', authUserMiddleware, userController.update);
router.delete('/delete-user/:id', authMiddleware, userController.deleteUser);
router.get('/get-all', userController.getAllUser);
router.get('/get-detail/:id', authUserMiddleware, userController.getDetailUser);
router.post('/refresh-token', userController.refreshToken);


export default router;