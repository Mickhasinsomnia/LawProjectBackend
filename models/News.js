const mongoose = require('mongoose')

const NewsSchema = new mongoose.Schema({
  poster_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  title:{
    type:String,
    required:true,
  },
  content:{
    type:String,
    required:true,
  },
  image:{
    type:String,
    required:true,
  },
})
