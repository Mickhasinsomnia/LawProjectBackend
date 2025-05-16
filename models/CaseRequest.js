const mongoose = require('mongoose')

const CaseRequestSchema = new mongoose.Schema({
  client_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
  },
  category_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
  },
  description:{
    type:String,
    required:true
  },
  note:{
    type:String,
    default: ""
  },
  status: {
      type: String,
      enum: ['confirmed','pending','cancelled'],
      default: 'pending'
  },
})

module.exports = mongoose.model('CaseRequest', CaseRequestSchema);
