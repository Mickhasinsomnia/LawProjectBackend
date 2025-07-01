import mongoose from "mongoose";

const CommentReportSchema = new mongoose.Schema({
  comment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
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
      'ข่มูลเท็จ',
      'อื่นๆ',
    ],
  },
  details: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ['pending', 'resolved'],
    default: 'pending',
  }
}, { timestamps: true });

export default mongoose.model("ReportComment", CommentReportSchema);
