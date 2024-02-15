import express from 'express';
import { auth } from '../users/user.auth.js';
import activityTypeController from './activityType.controller.js';

const router = express.Router();
router.get('/', auth, activityTypeController.getActivityType);
router.get('/:id', auth, activityTypeController.getActivityTypeById);
router.post('/', auth, activityTypeController.createActivityType);
router.put('/:id', auth, activityTypeController.updateActivityType);
router.delete('/:id', auth, activityTypeController.deleteActivityType);

export default router;
