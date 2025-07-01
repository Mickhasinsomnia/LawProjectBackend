import mongoose from 'mongoose'

const OtpSchema = new mongoose.Schema({
  tel: {
     type: String,
     required: true,
     match: [
       /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/,
       "Please enter a valid phone number in the format XXX-XXX-XXXX",
     ],
   },
  otp:{
    type:String,
     required:true,
  },
  status: {
    type: String,
      enum: ['verify', 'pending'],
      default: 'pending'
  },
  createdAt: {
      type: Date,
      default: Date.now,
      expires: 60,
    },
})

export default mongoose.model('Otp', OtpSchema);
