const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema({
  poster_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,

  },
  category: {
      type: String,
      enum: [

      ],
    required: true,
  },
  view_count :{
    type: Number,
    default: 0
  }
},{ timestamps: true } );

module.exports = mongoose.model("Article", ArticleSchema);
