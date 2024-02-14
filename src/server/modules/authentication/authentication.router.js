import express from 'express';
import authController from './authentication.controller.js';

const router = express.Router();
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify', authController.verify);
router.post('/resend-code', authController.resendCode);
router.patch('/:user_id/create-new-password', authController.createNewPassword);

export default router;
