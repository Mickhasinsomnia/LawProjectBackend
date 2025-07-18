import User from '../models/User.js';
import { Request, Response, NextFunction } from "express";

export const getAllUser = async(req: Request, res: Response, next: NextFunction) =>{
  const user = await User.find();

  res.status(200).json({
    success: true,
    data:user,
  });
}
