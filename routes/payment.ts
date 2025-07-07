import express from 'express';
import { addPayment, getPayment,handlePayment,verifyPayment,getPaymentById } from '../controllers/payment.js';
import { protect, authorize } from '../middleware/auth.js';


const router = express.Router();

router.post('/create/:id', protect, authorize('lawyer','admin'), addPayment);
router.get('/', protect, getPayment);
router.get('/:id',protect,getPaymentById)
router.post('/checkout/:id', protect,handlePayment);
router.post('/checkout/:id/verify',protect,verifyPayment)

export default router;
