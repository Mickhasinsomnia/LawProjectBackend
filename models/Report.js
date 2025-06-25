const mongoose = require("mongoose");

const ReportForumSchema = new mongoose.Schema({
  forum_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Forum",
    required: true,
  },
  reporter_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'สแปม',
      'เนื้อหาไม่เหมาะสม',
      'ละเมิดลิขสิทธิ์',
      'ข้อมูลเท็จ',
      'อื่นๆ',
    ],
  },
  details: {
    type: String,
    default:""
  },
  status: {
    type: String,
    enum: ['pending', 'resolved'],
    default: 'pending',
  }
}, { timestamps: true });

module.exports = mongoose.model("ReportForum", ReportForumSchema);
