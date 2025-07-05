import express from 'express';
import multer from 'multer';
import { register, login, logout, getMe, updateProfile, updatePhoto, deletePhoto, resetPassword,oauthLogin } from '../controllers/auth.js';
import { protect, otpStatusCheck, resetPasswordChek } from '../middleware/auth.js';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/oauthLogin',oauthLogin)
router.get('/logout', logout);
router.get('/getMe', protect, getMe);
router.put('/updateProfile', protect, updateProfile);
router.put('/updatePhoto', protect, upload.single('image'), updatePhoto);
router.delete('/deletePhoto', protect, deletePhoto);
router.put('/resetPassword', resetPasswordChek, resetPassword);

export default router;
