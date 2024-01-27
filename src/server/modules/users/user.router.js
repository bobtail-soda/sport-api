import express from 'express';
import userController from './user.controller.js';

const router = express.Router();
router.post('/', userController.createUser);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);

router.put('/:id', userController.updateUser);
router.patch('/:id/change-password', userController.changePassword);
router.delete('/:id', userController.deleteUser);

export default router;
