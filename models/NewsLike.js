const mongoose = require('mongoose');

const NewsLikeSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  news_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News',
    required: true,
  },
}, {
  timestamps: true,
});

NewsLikeSchema.index({ user_id: 1, news_id: 1 }, { unique: true });

module.exports = mongoose.model('NewsLike', NewsLikeSchema);
