import Otp from '../models/Otp.js';
import User from '../models/User.js';
import { Request, Response ,NextFunction} from 'express';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const createOtpEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tel = req.body.tel;
    if (!tel) {
      res.status(400).json({ success: false, message: "Telephone number required" });
      return;
    }

    const found = await Otp.findOne({ tel: tel });

    if(found){
      await found.deleteOne();
    }
    const otp = generateOtp();
    await Otp.create({ tel, otp });
    res.status(201).json({ success: true, message: "Verify with otp", otp });
    return;
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
    return;
  }
};

export const createOtpByEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.body.email;
    if (!email) {
      res.status(400).json({ success: false, message: "Email is required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ success: false, message: "User not found" });
      return;
    }
    // ... rest of the logic

    const tel = user.tel;
    if (!tel) {
      res.status(400).json({ success: false, message: "User has no phone number" });
      return;
    }

    const existingOtp = await Otp.findOne({ tel });
    if (existingOtp) {
      await existingOtp.deleteOne();
    }

    const otp = generateOtp();
    await Otp.create({ tel, otp });

    res.status(201).json({ success: true, message: "OTP sent", otp });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
    return;
  }
};


export const verifyOtp = async (req: Request, res: Response, next: NextFunction) =>{
  try {
    const { otp, tel } = req.body;
    if (!otp) {
      res.status(400).json({ success: false, message: "Please enter otp" });
      return;
    }
    if (!tel) {
      res.status(400).json({ success: false, message: "Please enter phone number" });
      return;
    }

    const found = await Otp.findOne({ tel, otp });

    if(!found){
       res.status(400).json({ success: false, message: "OTP not found or invalid" });
       return;
    }

    if (found.status === 'verify') {
          res.status(200).json({ success: true, message: "OTP already verified" });
          return;
    }

    found.status = "verify";
    await found.save();

    res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
