const { register, login,logout,getMe,updateProfile,updatePhoto,deletePhoto,resetPassword } = require('../controllers/auth');

const express = require('express');
const multer = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const {protect,otpStatusCheck,resetPasswordChek} = require('../middleware/auth')

const router = express.Router();

router.post('/register',otpStatusCheck,register);
router.post('/login',login);
router.get('/logout', logout);
router.get('/getMe', protect,getMe);
router.put('/updateProfile', protect, updateProfile);
router.put('/updatePhoto', protect,upload.single('image'), updatePhoto);
router.delete('/deletePhoto', protect, deletePhoto);
router.put('/resetPassword', resetPasswordChek, resetPassword);


module.exports = router;
