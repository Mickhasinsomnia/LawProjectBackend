const mongoose = require('mongoose');

const CaseRequestSchema = new mongoose.Schema({
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lawyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lawyer',
    required: true
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  consultation_type: {
    type: String,
    enum: ['per_session', 'per_hour'],
    required: true
  },
  consultation_duration: {
    type: Number,
    required: true
  },
  consultation_price: {
    type: Number,
    required: true
  },
  consultation_date: {
    type: Date,
    required: true
  },
  consultation_status: {
    type: String,
    enum: ['reserved', 'cancelled', 'completed', 'pending'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CaseRequest', CaseRequestSchema);
