import mongoose from 'mongoose';

const CaseRequestSchema = new mongoose.Schema({
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  title:{
    type: String,
    required: true
  },
  lawyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lawyer',
  },
  offered_Lawyers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lawyer'
      }
    ],
  category_type: {
    type: String,
    enum: ['civil', 'criminal','unknown'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  consultation_date: {
    type: Date
  },
  consultation_status: {
    type: String,
    enum: ['pending', 'cancelled', 'active','rejected'],
    default: 'pending'
  },
  note: {
    type: String,
    default: ''
  },
  files:{
    type: [String],
    default:[]
  },
  summons:{
    type: String,
    default:''
}

},{ timestamps: true });

export default mongoose.model('CaseRequest', CaseRequestSchema);
