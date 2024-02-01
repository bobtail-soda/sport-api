import express from 'express';
import userController from './user.controller.js';
import { auth } from './user.auth.js';
import { uploadToCloudinary, upload, updatePhotoByUserID} from '../uploadPicture/cloundinary.js'

const router = express.Router();
router.post('/', userController.createUser);
router.get('/', auth, userController.getUsers);
router.get('/:id', auth, userController.getUserById);

router.put('/:id', auth, userController.updateUser);
router.patch('/:id/change-password', auth, userController.changePassword);
router.delete('/:id',  auth, userController.deleteUser);
router.patch('/photo/:id', upload.single('photo'), uploadToCloudinary, updatePhotoByUserID)

export default router;
