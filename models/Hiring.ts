import mongoose from 'mongoose'

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
  detail:{
    type:String,
    default: ""
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
},{ timestamps: true })

export default mongoose.model('Hiring', HiringSchema);
