import express from 'express';
import { addPayment, getPayment, payVerify } from '../controllers/payment.js';
import { protect, authorize } from '../middleware/auth.js';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.post('/create/:id', protect, authorize('lawyer'), addPayment);
router.get('/', protect, getPayment);
router.post('/:id', upload.single('file'), payVerify);

export default router;
