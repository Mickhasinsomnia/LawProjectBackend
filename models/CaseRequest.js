const mongoose = require('mongoose')

const CaseRequestSchema = new mongoose.Schema({
  client_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
  },
  category_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Category',
    required:true
  },
  description:{
    type:String,
    required:true
  },
  lawyer_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'lawyer',
    required:true
  },
  note:{
    type:String,
    default: ""
  },
  status: {
      type: String,
      enum: ['open', 'assigned', 'cancelled'],
      default: 'open'
  },
})

module.exports = mongoose.model('CaseRequest', CaseRequestSchema);
