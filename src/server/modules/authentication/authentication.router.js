import express from 'express';
import authController from './authentication.controller.js';

const router = express.Router();
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/verify', authController.verify);
router.post('/resend-code', authController.resendCode);
router.patch('/:user_id/create-new-password', authController.createNewPassword);
router.patch('/check-password/:user_id', authController.checkPassword);
router.post('/signup', authController.signup);

export default router;
