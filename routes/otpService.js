const express = require('express');
const { createOtpEntry, verifyOtp,createOtpByEmail } = require('../controllers/otpService');

const router = express.Router();

router.post('/send', createOtpEntry);
router.post('/verify', verifyOtp);
router.post('/resetPassword', createOtpByEmail);

module.exports = router;
