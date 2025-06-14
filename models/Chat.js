const mongoose = require('mongoose')

const ChatSchema = new mongoose.Schema({
  sender_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text:{
    type:String,
    required:true
  },
},{ timestamps: true })

module.exports = mongoose.model('Chat', ChatSchema);
