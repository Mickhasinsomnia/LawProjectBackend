// routes/chat.js
const express = require('express');
const router = express.Router();
const {protect} = require('../middleware/auth')
const {addChat,getChat,addAiChat} = require ('../controllers/chat')

router.post('/', protect, addChat);
router.get('/:id', protect,getChat);
router.post('/ai',protect,addAiChat)

module.exports = router;
