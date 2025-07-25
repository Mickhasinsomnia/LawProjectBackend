import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
  },
    fileUrl: {
      type: String,
    },
    fileType: {
      type: String,
    },
  },{ timestamps: true });

export default mongoose.model('Chat', ChatSchema);
