import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { Request, Response, NextFunction } from 'express';

// Protect routes
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token || token === "null") {
    res.status(401).json({ success: false, message: "Not authorized to access this route" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    const userId = (decoded as { id: string }).id;
    req.user = await User.findById(userId);


    next();
  } catch (err: any) {
    console.error(err.stack);
    res.status(401).json({ success: false, message: "Not authorized to access this route" });
    return;
  }
};


// Grant access to specific roles
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `User role ${req.user?.role} is not authorized to access this route`,
      });
      return;
    }
    next();
  };
};

// Check OTP status
export const otpStatusCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const found = await Otp.findOne({ tel: req.body.tel });

    if (!found) {
      res.status(400).json({ success: false, message: 'OTP entry not found' });
      return;
    }

    if (found.status !== 'verify') {
      res.status(400).json({ success: false, message: 'OTP not verified' });
      return;
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
    return;
  }
};

// Check before resetting password
export const resetPasswordChek = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.body.email;

    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ success: false, message: 'User not found' });
      return;
    }

    const tel = user.tel;
    const found = await Otp.findOne({ tel });

    if (!found) {
      res.status(400).json({ success: false, message: 'OTP entry not found' });
      return;
    }

    if (found.status !== 'verify') {
      res.status(400).json({ success: false, message: 'OTP not verified' });
      return;
    }

    await found.deleteOne();
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
    return;
  }
};
