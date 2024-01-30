import express from 'express';
import exerciseActivityController from './exerciseActivity.controller.js';
// import { auth } from '../users/user.auth.js';

const router = express.Router();
router.get('/', exerciseActivityController.getExerciseActivity);
router.post('/', exerciseActivityController.createExerciseActivity);


export default router;
