const mongoose=require('mongoose')

const ActivitySchema=new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  lawyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  timeStamp: {
    type: Date,
    required: true
  },

  location: {
      type: String,
      required: true,
    },

  status: {
      type: String,
      enum: ['available', 'booked'],
      default: 'available'
  },

  detail: {
      type: String,
      default: ""
  }
})

module.exports = mongoose.model('Activity', ActivitySchema);
