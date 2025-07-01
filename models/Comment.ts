import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  forum_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  content: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model('Comment', CommentSchema);
