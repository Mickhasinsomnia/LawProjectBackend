// routes/chat.js
const express = require('express');
const router = express.Router();
const {protect} = require('../middleware/auth')
const {addChat,getChat} = require ('../controllers/chat')

router.post('/', protect, addChat);
router.get('/:id', protect,getChat);


module.exports = router;
