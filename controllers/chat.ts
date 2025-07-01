import Chat from "../models/Chat.js";
import { Request, Response ,NextFunction} from "express";

//@desc  Add new chat message
//POST /api/v1/chat
//@access Private
export const addChat = async (req:Request, res:Response ,next: NextFunction) => {
  try {
    const { receiver_id, text } = req.body;

    const sender_id = req.user?.id;

    const newMessage = await Chat.create({ sender_id, receiver_id, text });

    res.status(201).json(newMessage);
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
};

//@desc    Get chat messages between authenticated user and specified user
//@route   GET /api/v1/chat/:id
//@access  Private
export const getChat = async (req:Request, res:Response ,next: NextFunction) => {
  try {
    const sender_id = req.user?.id;
    const receiver_id = req.params.id;

    if (!receiver_id) {
      res.status(400).json({ error: 'receiver_id is required' });
      return;
    }

    const chats = await Chat.find({
      $or: [
        { sender_id, receiver_id },
        { sender_id: receiver_id, receiver_id: sender_id },
      ],
    }).sort({ createdAt: 1});
    res.status(200).json(chats);
    return;
  } catch (error:any) {
    res.status(500).json({ error: error.message });
    return;
  }
};

//@desc    Add a chat message from AI to the logged-in user
//@route   POST /api/v1/chat/ai
//@access  Private
export const addAiChat = async (req:Request, res:Response ,next: NextFunction) => {
  try {
    const { receiver_id, text } = req.body;
    const aiId = '6828a931e92578c60ee00ebd'; // will fix later

    const newMessage = await Chat.create({ sender_id: aiId, receiver_id, text });

    res.status(201).json(newMessage);
    return;
  } catch (error:any) {
    res.status(500).json({ error: error.message });
    return;
  }
};
