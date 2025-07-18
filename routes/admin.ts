import express from 'express'
import { protect, authorize } from '../middleware/auth.js';
import {getAllUser} from '../controllers/admin.js'
const router = express.Router();


router.get('/user', protect, authorize('admin'), getAllUser);

export default router;
