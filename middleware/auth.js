const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Otp = require("../models/Otp");
//Protect routes
exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  //Make sure token exists
  if (!token || token == "null") {
    return res
      .status(401)
      .json({ success: false, message: "Not authorize to access this route" });
  }

  try {
    //Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    console.log(err.stack);
    return res
      .status(401)
      .json({ success: false, message: "Not authorize to access this route" });
  }
};

// Grant access to spesific roles
exports.authorize = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

exports.otpStatusCheck = async (req, res, next) => {
  try {
    const found = await Otp.findOne({ tel: req.body.tel });

    if (!found) {
      return res.status(400).json({ success: false, message: 'OTP entry not found' });
    }

    if (found.status !== 'verify') {
      return res.status(400).json({ success: false, message: 'OTP not verified' });
    }


    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.resetPasswordChek = async (req, res, next) => {
  try {
    const email = req.body.email;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const tel = user.tel;
    const found = await Otp.findOne({ tel });

    if (!found) {
      return res.status(400).json({ success: false, message: 'OTP entry not found' });
    }

    if (found.status !== 'verify') {
      return res.status(400).json({ success: false, message: 'OTP not verified' });
    }

    await found.deleteOne();
    next();

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
