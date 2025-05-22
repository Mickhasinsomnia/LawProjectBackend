const mongoose=require('mongoose')

const AppointmentSchema=new mongoose.Schema({
  hiringId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  timeStamp: {
    type: Date,
    required: true
  },
  task: {
      type: String,
      required: true,
    },
  note: {
    type: String,
    default:"",
      },
  location: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
})

module.exports = mongoose.model('Appointment', AppointmentSchema);
