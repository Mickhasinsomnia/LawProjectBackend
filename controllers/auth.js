const User = require("../models/User");
const {
  generateFileName,
  uploadFile,
  getObjectSignedUrl,
  deleteFile,
} = require("./s3.js");
//@desc Register user
//@route POST /api/v1/auth/register
//@access Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, tel,line_id, role, location,thai_id } = req.body;


    const thaiIdRegex = /^\d-\d{4}-\d{5}-\d{2}-\d$/;
        if (thai_id && !thaiIdRegex.test(thai_id)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid Thai ID format. Use format: X-XXXX-XXXXX-XX-X',
          });
        }
    // Create User
    const user = await User.create({
      name,
      email,
      password,
      tel,
      line_id,
      role,
      location,
      thai_id
    });

    sendTokenResponse(user, 200, res); // Create token
  } catch (err) {
    res.status(400).json({ success: false, message: "bad request" });
    console.log(err);
  }
};

//@desc Login user
//@route POST /api/v1/auth/login
//@access Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, msg: "Please provide an email and password" });
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid credentials" });
    }

    // Check if password matches

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid credentials" });
    }

    if (user.photo && !user.photo.startsWith("http")) {
          user.photo = await getObjectSignedUrl(user.photo);
    }

    // const token = user.getSignedJwtToken();
    // res.status(200).json({sucess:true,token});
    sendTokenResponse(user, 200, res);

    //********ที่เพิ่มเข้ามา*********
  } catch (err) {
    return res
      .status(401)
      .json({
        success: false,
        msg: "Cannot convert email or password to string",
      });
  }
  //********ที่เพิ่มเข้ามา*********
};

//Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  //Create token
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  console.log(options.expires);
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie('token',token,options).json({success:true,_id: user._id,
    name: user.name,
    email: user.email,
    role:user.role,
    token,
    photo: user.photo || undefined,
  });
};

//At the end of file
//@desc Get current Logged in user
//@route GET /api/vl/auth/me
//@access Private
exports.getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (user.photo && !user.photo.startsWith("http")) {
    user.photo = await getObjectSignedUrl(user.photo);
  }


  const userObj = user.toObject();
  if (user.thai_id && user.thai_id !== "") {
    userObj.thai_id = user.getDecryptedThaiId();
  }
  res.status(200).json({
    success: true,
    data: userObj,
  });
};

//@desc Log user out / clear cookie
//@route GET /api/v1/auth/logout
//@access Private
exports.logout = async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, data: {} });
};

//@desc Update user profile
//@route PUT /api/v1/auth/updateProfile
//@access Private
  exports.updateProfile = async (req, res, next) => {
    try {

      const user = await User.findById(req.user.id);

      const { thai_id } = req.body;

      const thaiIdRegex = /^\d-\d{4}-\d{5}-\d{2}-\d$/;
      if (thai_id !== "" && !thaiIdRegex.test(thai_id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Thai ID format. Use format: X-XXXX-XXXXX-XX-X',
        });
      }


      const allowedFields = ['name', 'tel', 'line_id', 'location', 'thai_id'];
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          user[field] = req.body[field];
        }
      });

      await user.save();

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (err) {
      console.error(err);
      res.status(400).json({
        success: false,
        message: 'Could not update profile'
      });
    }
  };

  //@desc Update user profile photo
  //@route PUT /api/v1/auth/updatePhoto
  //@access Private
  exports.updatePhoto = async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      if (req.file) {
        const imageName = generateFileName();
        if (user.photo) {
            await deleteFile(user.photo);
        }
        await uploadFile(req.file, imageName, req.file.mimetype);
        req.body.photo = imageName;
      }

      user.photo = req.body.photo;

      await user.save();


      res.status(200).json({
        success: true,
        data: user
      });
    } catch (err) {
      console.error(err);
      res.status(400).json({
        success: false,
        message: 'Could not delete profile picture'
      });
    }
  };

  //@desc Delete user profile
  //@route DELETE /api/v1/auth/deletePhoto
  //@access Private
    exports.deletePhoto = async (req, res, next) => {
      try {
        const user = await User.findById(req.user.id);
        await deleteFile(user.photo);
        await user.updateOne({ $unset: { photo: 1 } });


        res.status(200).json({
          success: true,
          data: user
        });
      } catch (err) {
        console.error(err);
        res.status(400).json({
          success: false,
          message: 'Could not delete profile picture'
        });
      }
    };

exports.resetPassword = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please enter your email and new password' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = password;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
