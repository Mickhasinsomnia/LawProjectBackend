const { register, login,logout,getMe,updateProfile,deleteProfile } = require('../controllers/auth');

const express = require('express');
const multer = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const {protect,otpStatusCheck} = require('../middleware/auth')

const router = express.Router();

router.post('/register',otpStatusCheck,register);
router.post('/login',login);
router.get('/logout', logout);
router.get('/getMe', protect,getMe);
router.put('/updateProfile',protect,upload.single('image'),updateProfile)
router.delete('/deleteProfile', protect, deleteProfile);


module.exports = router;
