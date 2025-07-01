import mongoose from 'mongoose';

const ArticleLikeSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  article_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News',
    required: true,
  },
}, {
  timestamps: true,
});

ArticleLikeSchema.index({ user_id: 1, article_id: 1 }, { unique: true });

export default mongoose.model('ArticleLike', ArticleLikeSchema);
