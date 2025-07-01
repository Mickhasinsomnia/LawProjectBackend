import express from 'express';
import { createOtpEntry, verifyOtp, createOtpByEmail } from '../controllers/otpService.js';

const router = express.Router();

router.post('/send', createOtpEntry);
router.post('/verify', verifyOtp);
router.post('/resetPassword', createOtpByEmail);

export default router;
