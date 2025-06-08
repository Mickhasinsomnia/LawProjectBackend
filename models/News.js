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
  category: {
    type: String,
    enum: [
      'ข่าวกฎหมายใหม่',
      'การตีความกฎหมาย',
      'คดีความสำคัญ',
      'กฎหมายแรงงาน',
      'กฎหมายธุรกิจ',
      'กฎหมายครอบครัว',
      'กฎหมายอาญา',
      'ข่าวกิจกรรมทางกฎหมาย',
      'บทวิเคราะห์ทางกฎหมาย',
    ],
    required: true,
  }

},{ timestamps: true })

module.exports = mongoose.model('News', NewsSchema);
