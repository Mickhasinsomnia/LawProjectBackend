// routes/chat.js
const express = require('express');
const router = express.Router();
const {protect} = require('../middleware/auth')
const {addChat} = require ('../controllers/chat')

router.post('/', protect, addChat);



module.exports = router;
