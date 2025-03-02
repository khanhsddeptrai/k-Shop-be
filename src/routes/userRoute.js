import express from 'express';
const router = express.Router();
import userController from '../controllers/userController.js';

router.post('/', userController.createUser);

export default router;