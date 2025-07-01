import { createWorkingDay,updateWorkingDay } from '../controllers/workingDay.js';

import { protect, authorize } from '../middleware/auth.js';

import express from 'express';

const router = express.Router();

router.route('/').post(protect,authorize('lawyer'),createWorkingDay).put(protect,authorize('lawyer'),updateWorkingDay);

export default router;
