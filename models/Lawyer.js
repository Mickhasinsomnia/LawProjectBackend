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
  }
}, {
  _id: false,
});
