const mongoose = require('mongoose')

const PaymentSchema = new mongoose.Schema({

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
  amount:{
    type:Number
  },
})

module.exports = mongoose.model('Payment', PaymentSchema);
