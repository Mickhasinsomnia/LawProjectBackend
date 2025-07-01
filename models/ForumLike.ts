import mongoose from 'mongoose';

const ForumLikeSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  forum_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Forum',
    required: true,
  },
}, {
  timestamps: true,
});

ForumLikeSchema.index({ user_id: 1, forum_id: 1 }, { unique: true });

const ForumLike = mongoose.model('ForumLike', ForumLikeSchema);
export default ForumLike;
