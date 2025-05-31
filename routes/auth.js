const { register, login,logout,getMe } = require('../controllers/auth');

const express = require('express');

const {protect,otpStatusCheck} = require('../middleware/auth')

const router = express.Router();

router.post('/register',otpStatusCheck,register);
router.post('/login',login);
router.get('/logout', logout);
router.get('/getMe', protect,getMe);


module.exports = router;
