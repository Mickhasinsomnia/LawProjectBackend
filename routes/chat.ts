import express from 'express';
import { protect } from '../middleware/auth.js';
import { addChat, getChat, addAiChat,getAllChatUsers } from '../controllers/chat.js';
import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();

router.post("/", protect, upload.single("file"), addChat);
router.get('/users',protect,getAllChatUsers)
router.get('/:id', protect, getChat);
router.post('/ai', protect, addAiChat);

export default router;
