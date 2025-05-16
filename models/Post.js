const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
  user_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
  },
  title:{
    type:String,
    required:true,
  },
  content:{
    type:String,
    required:true,
  },
})

module.exports = mongoose.model('Post', PostSchema);
