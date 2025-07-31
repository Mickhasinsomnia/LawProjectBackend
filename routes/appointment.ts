import express from 'express';
import { createAppointment, deleteAppointment, getAppointments, getAppointmentsByCaseId } from '../controllers/appointment.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', protect, authorize('lawyer','user','admin'), createAppointment);

router.route('/:id').delete(protect,deleteAppointment);

router.get('/case/:caseId',protect,authorize('lawyer', 'user', 'admin'),getAppointmentsByCaseId);

router.get('/', protect, authorize('lawyer', 'user', 'admin'), getAppointments);


export default router;
