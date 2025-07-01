import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { addLawyer, getLawyerById, updateLawyer, deleteLawyer, getAllLawyers, changeVerifyStatus } from '../controllers/lawyer.js';

const router = express.Router();

router.route('/').post(protect, authorize('lawyer'), addLawyer).get(getAllLawyers);

router.route('/:id').get(getLawyerById).put(protect, authorize('lawyer'), updateLawyer).delete(protect, authorize('lawyer'), deleteLawyer);

router.route('/:id/status').put(protect, authorize('admin'), changeVerifyStatus);

export default router;
