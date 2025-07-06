import express from 'express';
import { addPayment, getPayment,handlePayment } from '../controllers/payment.js';
import { protect, authorize } from '../middleware/auth.js';


const router = express.Router();

router.post('/create/:id', protect, authorize('lawyer'), addPayment);
router.get('/', protect, getPayment);
router.post('/checkout/:id', handlePayment);

export default router;
