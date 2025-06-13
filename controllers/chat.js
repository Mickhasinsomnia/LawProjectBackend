const mongoose = require('mongoose');
const Chat = require('../models/Chat');

exports.addChat = async (req, res) => {
  try {
    const { receiver_id, text } = req.body;

    const sender_id = req.user.id

    const newMessage = await Chat.create({ sender_id, receiver_id, text });


    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
