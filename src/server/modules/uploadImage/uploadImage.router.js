import express from 'express';
import uploadImageController from '../uploadImage/uploadImage.controller.js';
import { uploadSingle } from '../../utils/cloudinary.js';

const router = express.Router();
router.post('/', uploadSingle, uploadImageController.uploadImage);

export default router;
