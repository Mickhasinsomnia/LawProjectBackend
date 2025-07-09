import express from 'express';
import { createAppointment, updateAppointment, deleteAppointment, getAppointments } from '../controllers/appointment.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/create/:id', protect, authorize('lawyer','user','admin'), createAppointment);

router.route('/:id').put(updateAppointment).delete(deleteAppointment);

router.get('/', protect, authorize('lawyer', 'user', 'admin'), getAppointments);

export default router;
