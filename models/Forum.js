const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
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
    required: true,
  },
  category: {
      type: String,
      enum: [
        'คำถามกฎหมาย',        // Legal Questions
        'คำปรึกษาทั่วไป',      // General Advice
        'ประสบการณ์ผู้ใช้',    // User Experiences
        'ข่าวสารกฎหมาย',       // Legal News
        'กิจกรรมและสัมมนา',    // Events and Seminars
      ],
    required: true,
  },
   timestamps: true,
});

module.exports = mongoose.model("Post", PostSchema);
