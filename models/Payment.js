const mongoose = require('mongoose')

const PaymentSchema = new mongoose.Schema({
  user_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
  },
  hiring_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Hiring',
    required:true
  },
  status:{
    type:String,
    enum: ['pending', 'paid', 'completed'],
    default: 'pending'
  },
  paid_at:{
    type:Date,
  },
})

module.exports = mongoose.model('Payment', PaymentSchema);
