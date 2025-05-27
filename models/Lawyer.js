const mongoose = require('mongoose');

const LawyerSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  photo: {
    type: String
  },
  slogan : {
    type: String,
    required: true
  },
  summary : {
    type: String,
    required: true
  },
  consultationRate: {
    min: { type: Number, required: true, min: 0 },
    max: { type: Number, required: true, min: 0 }
  },
  documentDeliveryRate: {
    min: { type: Number, required: false, min: 0 },
    max: { type: Number, required: false, min: 0 }
  },
  specialized: {
    type: [{ type: String, enum: ["คดีแพ่ง", "คดีอาญา", "คดีแรงงาน", "คดีเช่าซื้อหรือเช่าที่อยู่อาศัย", "คดีละเมิด / หมิ่นประมาท", "คดีหุ้นส่วนและการร่วมลงทุน", "คดีสัญญาและการผิดสัญญา", "คดีฉ้อโกงออนไลน์", "คดีคนต่างด้าว / ตรวจคนเข้าเมือง", "คดีหย่าและสิทธิการเลี้ยงดูบุตร", "คดีที่ดินและสิทธิครอบครอง", "คดีหนี้และการบังคับคดี"] }],
    default: []
  },
  has_law_license: {
    type: Boolean,
    default: false
  },
  is_verified_by_council: {
    type: Boolean,
    default: false
  },
  verificationDocs: {
    type: [String],
    default: []
  }

}, {
  timestamps: true,
  _id: false
});

module.exports = mongoose.model('Lawyer', LawyerSchema);
