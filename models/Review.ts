import mongoose from 'mongoose';

const LawyerReviewSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lawyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lawyer',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 0.5,
    max: 5,
    validate: {
      validator: function (val: number) {
        return Number.isFinite(val) && val * 2 === Math.floor(val * 2);
      },
      message: 'Rating must be in 0.5 steps (e.g. 1.0, 1.5, 2.0) from 0.5 to 5',
    },
  },
  comment: {
    type: String,
    required: true,
    maxlenght: 1000
  }
}, { timestamps: true });

export default mongoose.model('LawyerReview', LawyerReviewSchema);
