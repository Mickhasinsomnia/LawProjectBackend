const { register, login,logout,getMe } = require('../controllers/auth');

const express = require('express');

const router = express.Router();

router.post('/register',register);
router.post('/login',login);
router.get('/logout', logout);
router.get('/getMe', getMe);

module.exports = router;
