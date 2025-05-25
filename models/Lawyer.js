const mongoose = require('mongoose');

const LawyerSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: {
    type: String,
  },
  photo: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  experience: {
    type: Number,
    required: true
  },
  expertise: {
    type: String,
    required: true
  },
  win_rate: {
    type: Number,
    min: 0,
    max: 1
  },
  clients_count: {
    type: Number,
    default: 0
  },
  has_law_license: {
    type: Boolean,
    default: false
  },
  is_verified_by_council: {
    type: Boolean,
    default: false
  },
  total_score: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  _id: false // Prevent Mongoose from auto-generating _id
});

module.exports = mongoose.model('Lawyer', LawyerSchema);
