const mongoose = require("mongoose");
const Chat = require("../models/Chat");

exports.addChat = async (req, res) => {
  try {
    const { receiver_id, text } = req.body;

    const sender_id = req.user.id;

    const newMessage = await Chat.create({ sender_id, receiver_id, text });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getChat = async (req, res) => {
  try {
    const sender_id = req.user.id;
    const receiver_id = req.params.id;

        if (!receiver_id) {
          return res.status(400).json({ error: 'receiver_id is required' });
        }

    const chats = await Chat.find({
      $or: [
        { sender_id, receiver_id },
        { sender_id: receiver_id, receiver_id: sender_id },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
