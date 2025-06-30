const mongoose = require('mongoose');

const CaseRequestSchema = new mongoose.Schema({
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  lawyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lawyer',
  },
  category_type: {
    type: String,
    enum: ['civil', 'criminal','unknown'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  consultation_date: { type: Date, required: true },

  consultation_status: {
    type: String,
    enum: ['pending', 'cancelled', 'confirmed','rejected'],
    default: 'pending'
  },
  note: {
    type: String,
    default: ''
  },
},{ timestamps: true });

module.exports = mongoose.model('CaseRequest', CaseRequestSchema);
