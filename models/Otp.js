const mongoose = require('mongoose')

const OtpSchema = new mongoose.Schema({
  tel: {
      type: String,
      required:true,
      match: [
          /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/,
      ]
  },
  otp:{
    type:String,
     required:true,
  }
})

module.exports = mongoose.model('Otp', OtpSchema);
