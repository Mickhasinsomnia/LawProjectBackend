import express from 'express';
import { addHiring, updateHiring, cancelHiring, getHiring, getHiringByClientId, getHiringByLawyerId } from '../controllers/hiring.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/client', protect, authorize('user','admin'), getHiringByClientId);
router.get('/lawyer', protect, authorize('lawyer','admin'), getHiringByLawyerId);

router.post('/create/:id', protect, authorize('lawyer','admin'), addHiring);

router.route('/:id')
  .get(protect, getHiring)
  .put(protect, authorize('lawyer'), updateHiring)
  .delete(protect, authorize('lawyer'), cancelHiring);

export default router;
