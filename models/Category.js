const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  desc:{
    type:String,
    required:true
  },
  note: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Category', CategorySchema);
