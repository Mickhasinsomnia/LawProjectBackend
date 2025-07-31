import { Request, Response, NextFunction } from "express";
import Notification from "../models/Notification.js";

// @desc    Get all notifications for the logged-in user
// @route   GET /api/v1/notifications
// @access  Private
export const getNotificationsByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const notifications = await Notification.find({ user: req.user?.id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: notifications });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: err.message,
    });
  }
};

// @desc    Create a notification
// @route   POST /api/v1/notifications
// @access  Private/Admin or system internal
export const createNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user, type, message, link } = req.body;

    if (!user || !type || !message) {
      res.status(400).json({
        success: false,
        message: "User, type, and message are required",
      });
      return;
    }

    const notification = await Notification.create({ user, type, message, link });

    res.status(201).json({ success: true, data: notification });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to create notification",
      error: err.message,
    });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ success: false, message: "Notification not found" });
      return;
    }

    res.status(200).json({ success: true, data: notification });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update notification",
      error: err.message,
    });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/v1/notifications/:id
// @access  Private
export const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const notification = await Notification.deleteOne({ _id: req.params.id });

    if (!notification) {
      res.status(404).json({ success: false, message: "Notification not found" });
      return;
    }

    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: err.message,
    });
  }
};
