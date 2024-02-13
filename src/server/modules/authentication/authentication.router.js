import express from 'express';
import authenController from './authentication.controller.js';

const router = express.Router();
router.post('/login', authenController.login);
router.post('/forgot-password', authenController.forgotPassword);
router.post('/verify', authenController.verify);

export default router;
