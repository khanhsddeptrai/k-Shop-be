import express from 'express';
const router = express.Router();
import userController from '../controllers/userController.js';

router.post('/sign-up', userController.createUser);
router.post('/sign-in', userController.login);

export default router;