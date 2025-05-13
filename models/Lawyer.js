const mongoose=require('mongoose')

const LawyerSchema=new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  specialization: {
    type: String,
    required: true
  },

  // lawyerVerificationStatus: {
  //     type: String,
  //     enum: ['real', 'fake', 'pending'],
  //     default: 'pending'
  //   },

  //   barristerStatus: {
  //       type: String,
  //       enum: ['real', 'fake', 'pending'],
  //       default: 'pending'
  //     },

  experience:{
    type:Number,
    require:true,
    min:0
  },
  CaseWin:{
    type:Number,
    require:true,
    min:0
  },





}, {
  _id: false,
});
