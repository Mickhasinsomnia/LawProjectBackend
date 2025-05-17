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
    require:true
  },
  approved_at:{
    type:Date,
    required:true
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
    required:true
  },
  end_date:{
    type:Date,
    required:true
  }

})
