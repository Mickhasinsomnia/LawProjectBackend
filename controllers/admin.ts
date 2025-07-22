import User from "../models/User.js"
import News from "../models/News.js"
import CaseRequest from "../models/CaseRequest.js"
import Forum from "../models/Forum.js"
import Article from "../models/Article.js"
import type { Request, Response } from "express"
import { getObjectSignedUrl } from "./s3.js"

export const getAllUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().lean()
    const processedUsers = await Promise.all(
      users.map(async (user) => {
        if (user.photo && !user.photo.startsWith("http")) {
          user.photo = await getObjectSignedUrl(user.photo)
        }
        return user
      }),
    )
    res.status(200).json({
      success: true,
      data: processedUsers,
    })
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: err.message,
    })
  }
}

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  try {
    const user = await User.findById(id).lean()
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      })
      return
    }
    if (user.photo && !user.photo.startsWith("http")) {
      user.photo = await getObjectSignedUrl(user.photo)
    }
    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: err.message,
    })
  }
}

export const updateRole = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const { role } = req.body

  if (!role || !["admin", "user", "lawyer"].includes(role)) {
    res.status(400).json({
      success: false,
      message: "Invalid role specified",
    })
    return
  }
  try {
    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).lean()
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      })
      return
    }
    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update user role",
      error: err.message,
    })
  }
}

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const updates = req.body

  try {
    const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean()

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      })
      return
    }

    if (user.photo && !user.photo.startsWith("http")) {
      user.photo = await getObjectSignedUrl(user.photo)
    }

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (err: any) {
    if (err.name === "ValidationError") {
      res.status(400).json({
        success: false,
        message: err.message,
        error: err.errors,
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update user",
        error: err.message,
      })
    }
  }
}

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments()
    const registeredLawyers = await User.countDocuments({ role: "lawyer" })
    const totalNews = await News.countDocuments()
    const totalCaseRequests = await CaseRequest.countDocuments()
    const totalForums = await Forum.countDocuments()
    const totalArticles = await Article.countDocuments()

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        registeredLawyers,
        totalNews,
        totalCaseRequests,
        totalForums,
        totalArticles,
      },
    })
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: err.message,
    })
  }
}
