const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
  user_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
  },
  post_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Post',
    required:true
  },
  content:{
    type:String,
    required:true,
  },
})

module.exports = mongoose.model('Comment', CommentSchema);
