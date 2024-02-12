import express from 'express';
import dashboardController from './dashboard.controller.js';
import { auth } from '../users/user.auth.js';

const router = express.Router();
router.get('/summary-card/:user_id', dashboardController.getsummaryCardByUserId);
router.get('/activities-type/:id', dashboardController.getActivitiesTypeByUserId);
router.get('/graph-summary/:id', dashboardController.getGraphSummaryDataByUserId);

export default router;
