import express from 'express';
import { updatePhotoByUserID, uploadSingle, uploadToCloudinary } from '../../utils/cloudinary.js';
import { auth } from './user.auth.js';
import userController from './user.controller.js';

const router = express.Router();
router.post('/', userController.createUser);
router.get('/', auth, userController.getUsers);
router.get('/:id', auth, userController.getUserById);

router.post('/:id', auth, userController.updateUser);
router.patch('/:id/change-password', auth, userController.changePassword);
router.delete('/:id', auth, userController.deleteUser);
router.patch('/photo/:id', uploadSingle, uploadToCloudinary, updatePhotoByUserID);
router.post('/edit-profile/:id', uploadSingle, uploadToCloudinary, updatePhotoByUserID, userController.updateUser);

export default router;
