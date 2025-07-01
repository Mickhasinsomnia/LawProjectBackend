import express from 'express';
import { protect } from '../middleware/auth.js';
import { addChat, getChat, addAiChat } from '../controllers/chat.js';

const router = express.Router();

router.post('/', protect, addChat);
router.get('/:id', protect, getChat);
router.post('/ai', protect, addAiChat);

export default router;
