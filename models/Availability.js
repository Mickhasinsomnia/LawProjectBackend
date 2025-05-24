const mongoose = require('mongoose')

const Availability = new mongoose.Schema({
  layer_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Layer'
  },
  date: {
    type: Date,
    required: true
  },
  start_time: {
    type: String,
    required: true
  },
  end_time: {
    type: String,
    required: true
  },
  is_available: {
    type: Boolean,
    default: true
  },
  note: {
    type: String,
    default: ''
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Availability', Availability)
