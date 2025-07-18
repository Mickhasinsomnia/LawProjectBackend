import Chat from "../models/Chat.js";
import { Request, Response ,NextFunction} from "express";
import { getObjectSignedUrl } from "./s3.js";
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


export const getAllChatUsers = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const botId = "6828a931e92578c60ee00ebd";

    const chats = await Chat.find({
          $or: [{ sender_id: userId }, { receiver_id: userId }],
          // Exclude chats involving the bot:
          sender_id: { $ne: botId },
          receiver_id: { $ne: botId },
        })
      .populate('sender_id', 'name photo')
      .populate('receiver_id', 'name photo')
      .sort({ createdAt: -1 })
      .lean();

    const seen = new Set();
    const users = [];

    for (const chat of chats) {
      const candidates = [chat.sender_id, chat.receiver_id];

      for (const user of candidates) {
        const id = user._id.toString();
        if (id !== userId && !seen.has(id)) {
          seen.add(id);

          const objUser = user as { photo?: string };
          if (objUser.photo && !objUser.photo.startsWith('http')) {
            objUser.photo = await getObjectSignedUrl(objUser.photo);
          }

          users.push({ _id: user });
        }
      }
    }

    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
