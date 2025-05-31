const express = require('express');
const { createOtpEntry, verifyOtp } = require('../controllers/otpService');

const router = express.Router();

router.post('/send', createOtpEntry);
router.post('/verify', verifyOtp);

module.exports = router;
