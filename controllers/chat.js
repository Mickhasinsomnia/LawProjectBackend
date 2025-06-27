const mongoose = require("mongoose");
const Chat = require("../models/Chat");


//@desc  Add new chat message
//POST /api/v1/chat
//@access Private
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


//@desc    Get chat messages between authenticated user and specified user
//@route   GET /api/v1/chat/:id
//@access  Private
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
    }).sort({ createdAt: 1});
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//@desc    Add a chat message from AI to the logged-in user
//@route   POST /api/v1/chat/ai
//@access  Private
exports.addAiChat = async (req, res) => {
  try {
    const { receiver_id, text } = req.body;
    const aiId = '6828a931e92578c60ee00ebd'; // will fix later

    const newMessage = await Chat.create({ sender_id: aiId, receiver_id, text });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
