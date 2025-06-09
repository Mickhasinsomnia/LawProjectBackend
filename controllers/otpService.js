const Otp = require('../models/Otp');
const User = require('../models/User');

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.createOtpEntry = async (req, res, next) => {
  try {
    const tel = req.body.tel;
    if (!tel) {
      return res.status(400).json({ success: false, message: "Telephone number required" });
    }

    const found = await Otp.findOne({ tel: tel });

    if(found){
      await found.deleteOne();
    }
    const otp = generateOtp();
    await Otp.create({ tel, otp });
    return res.status(201).json({ success: true, message: "Verify with otp", otp });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createOtpByEmail = async (req, res, next) => {
  try {
    const email = req.body.email;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const tel = user.tel;
    if (!tel) {
      return res.status(400).json({ success: false, message: "User has no phone number" });
    }

    const existingOtp = await Otp.findOne({ tel });
    if (existingOtp) {
      await existingOtp.deleteOne();
    }

    const otp = generateOtp();
    await Otp.create({ tel, otp });

    return res.status(201).json({ success: true, message: "OTP sent", otp });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.verifyOtp = async (req,res,next) =>{
  try {
    const { otp, tel } = req.body;
    if (!otp) {
      return res.status(400).json({ success: false, message: "Please enter otp" });
    }
    if (!tel) {
      return res.status(400).json({ success: false, message: "Please enter phone number" });
    }

    const found = await Otp.findOne({ tel, otp });

    if(!found){
       return res.status(400).json({ success: false, message: "OTP not found or invalid" });
    }

    if (found.status === 'verify') {
          return res.status(200).json({ success: true, message: "OTP already verified" });
    }

    found.status = "verify";
    await found.save();

    return res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
