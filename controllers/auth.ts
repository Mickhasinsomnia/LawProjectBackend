import User from "../models/User.js";
import { generateFileName, uploadFile, getObjectSignedUrl, deleteFile } from "./s3.js";
import { Request, Response, NextFunction } from "express";
import { IUser } from "../models/User.js";
//@desc Register user
//@route POST /api/v1/auth/register
//@access Public
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, tel, line_id, role, location, thai_id } = req.body;

    const thaiIdRegex = /^\d-\d{4}-\d{5}-\d{2}-\d$/;
    if (thai_id && !thaiIdRegex.test(thai_id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid Thai ID format. Use format: X-XXXX-XXXXX-XX-X',
      });
      return;
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
  } catch (err: any) {
    res.status(400).json({ success: false, message: "bad request" });
  }
};

//@desc Login user
//@route POST /api/v1/auth/login
//@access Public
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      res.status(400).json({ success: false, msg: "Please provide an email and password" });
      return;
    }


    let user = await User.findOne({ email }).select("+password");

    if (!user) {
      res.status(400).json({ success: false, msg: "Invalid credentials" });
      return;
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      res.status(401).json({ success: false, msg: "Invalid credentials" });
      return;
    }



    if (user.photo && !user.photo.startsWith("http")) {
      user.photo = await getObjectSignedUrl(user.photo);
    }

    sendTokenResponse(user, 200, res);
    return;
  } catch (err: any) {
    res.status(401).json({
      success: false,
      msg: "Cannot convert email or password to string",
    });
  }
};

//Get token from model, create cookie and send response
const sendTokenResponse = (user: IUser, statusCode: number, res: Response) => {
  //Create token
  const token = user.getSignedJwtToken();
  const options: any = {
    expires: new Date(
      Date.now() + Number(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
    photo: user.photo || undefined,
  });
  return;
};

//At the end of file
//@desc Get current Logged in user
//@route GET /api/vl/auth/me
//@access Private
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user?.id);

  if (user && user.photo && !user.photo.startsWith("http")) {
    user.photo = await getObjectSignedUrl(user.photo);
  }

  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
}

  const userObj = user.toObject();
  if (user.thai_id && user.thai_id !== "") {
    userObj.thai_id = user.getDecryptedThaiId() ?? undefined;
  }
  res.status(200).json({
    success: true,
    data: userObj,
  });
  return;
};

//@desc Log user out / clear cookie
//@route GET /api/v1/auth/logout
//@access Private
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, data: {} });
  return;
};

//@desc Update user profile
//@route PUT /api/v1/auth/updateProfile
//@access Private
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const { thai_id } = req.body;

    const thaiIdRegex = /^\d-\d{4}-\d{5}-\d{2}-\d$/;
    if (thai_id !== "" && !thaiIdRegex.test(thai_id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid Thai ID format. Use format: X-XXXX-XXXXX-XX-X',
      });
      return;
    }

    const allowedFields = ['name', 'tel', 'line_id', 'location', 'thai_id'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        (user as any)[field] = req.body[field];
      }
    });

    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err: any) {
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
export const updatePhoto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (req.file) {
      const imageName = generateFileName();
      if (user.photo) {
        await deleteFile(user.photo);
      }
      await uploadFile(req.file, imageName, req.file.mimetype);
      user.photo = imageName;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: 'Could not update profile picture'
    });
  }
};

  //@desc Delete user profile
  //@route DELETE /api/v1/auth/deletePhoto
  //@access Private
export const deletePhoto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (user.photo) {
      await deleteFile(user.photo);
    }
    await user.updateOne({ $unset: { photo: 1 } });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: 'Could not delete profile picture'
    });
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Please enter your email and new password' });
    return;
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    user.password = password;
    await user.save();
    res.status(200).json({ success: true, message: 'Password reset successfully' });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
    return;
  }
};
