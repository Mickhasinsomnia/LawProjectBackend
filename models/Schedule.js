const mongoose=require('mongoose')

const ScheduleSchema=new mongoose.Schema({
  lawyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  timeStamp: {
    type: Date,
    required: true
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

module.exports = mongoose.model('Schedule', ScheduleSchema);
