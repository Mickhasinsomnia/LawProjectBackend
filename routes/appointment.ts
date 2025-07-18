import express from 'express';
import { createAppointment, deleteAppointment, getAppointments } from '../controllers/appointment.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/create/:id', protect, authorize('lawyer','user','admin'), createAppointment);

router.route('/:id').delete(protect,deleteAppointment);

router.get('/', protect, authorize('lawyer', 'user', 'admin'), getAppointments);

export default router;
