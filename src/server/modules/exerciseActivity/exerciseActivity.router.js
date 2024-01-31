import express from 'express';
import { auth } from '../users/user.auth.js';
import exerciseActivityController from './exerciseActivity.controller.js';

const router = express.Router();
router.get('/', auth, exerciseActivityController.getExerciseActivity);
router.get('/:id', auth, exerciseActivityController.getExerciseActivityById);
router.post('/', auth, exerciseActivityController.createExerciseActivity);
router.put('/:id', auth, exerciseActivityController.updateExerciseActivity);
router.delete('/:id', auth, exerciseActivityController.deleteExerciseActivity);

export default router;
