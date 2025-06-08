const mongoose = require('mongoose')

const HiringSchema = new mongoose.Schema({
  case_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'CaseRequest',
    require:true
  },
  lawyer_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Lawyer',
  },
  client_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
  },
  approved_at: {
    type: Date,
    default: Date.now
  },
  task:{
    type:String,
     require:true
  },
  note:{
    type:String,
    default: ""
  },
  status: {
    type: String,
      enum: ['active', 'cancelled','completed'],
      default: 'active'
  },
  start_date:{
    type:Date,
    default: Date.now
  },
},{ timestamps: true })

module.exports = mongoose.model('hiring', HiringSchema);
