// routes/chat.js
const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');

// Save a new message
router.post('/', async (req, res) => {
  try {
    const { sender_id, receiver_id, text } = req.body;

    const newMessage = new Chat({ sender_id, receiver_id, text });
    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get message history between 2 users
router.get('/:senderId/:receiverId', async (req, res) => {
  const { senderId, receiverId } = req.params;
  try {
    const messages = await Chat.find({
      $or: [
        { sender_id: senderId, receiver_id: receiverId },
        { sender_id: receiverId, receiver_id: senderId }
      ]
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

module.exports = router;
