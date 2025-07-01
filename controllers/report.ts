import ReportForum from "../models/ForumReport.js";
import CommentReport from "../models/CommentReport.js";
import Comment from "../models/Comment.js";
import Forum from "../models/Forum.js";
import { Request, Response } from "express";

//@desc  Create a report
//POST /api/v1/forum/:forumId/report
//@access Private
export const createReport = async (req: Request, res: Response) => {
  try {
    const { reason, details } = req.body;
    const forum_id = req.params.forumId;
    if (!forum_id || !reason) {
      res.status(400).json({ success: false, message: "forum_id and reason are required" });
      return;
    }

    const exists = await Forum.exists({ _id: req.params.forumId });
    if (!exists) {
      res.status(404).json({ success: false, message: "Forum not found" });
      return;
    }

    const report = await ReportForum.create({
      forum_id,
      reporter_id: req.user?.id,
      reason,
      details,
    });

    res.status(201).json({ success: true, data: report });
  } catch (err: any) {
    res.status(400).json({ success: false, message: "Failed to create report", error: err.message });
  }
};


//@desc  get all report
//GET /api/v1/report/forum
//@access Private
export const getReports = async (req: Request, res: Response) => {
  try {
    const reports = await ReportForum.find()
      .populate('forum_id', 'title')
      .populate('reporter_id', 'name')
      .lean();

    res.status(200).json({ success: true, data: reports });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to fetch reports", error: err.message });
  }
};

//@desc  get all report
//GET /api/v1/report/:reportId
//@access Private
export const getReport = async (req: Request, res: Response) => {
  try {
    const report = await ReportForum.findById(req.params.reportId)
      .populate('forum_id', 'title content')
      .populate('reporter_id', 'name email')
      .lean();

    if (!report) {
      res.status(404).json({ success: false, message: "Report not found" });
      return;
    }

    res.status(200).json({ success: true, data: report });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to fetch report", error: err.message });
  }
};

//@desc  Create a comment report
//POST /api/v1/comment/:commentId/report
//@access Private
export const createCommentReport = async (req: Request, res: Response) => {
  try {
    const { reason, details } = req.body;
    const comment_id = req.params.commentId;

    if (!comment_id || !reason) {
      res.status(400).json({ success: false, message: "comment_id and reason are required" });
      return;
    }

    const exists = await Comment.exists({ _id: req.params.commentId });
    if (!exists) {
      res.status(404).json({ success: false, message: "Comment not found" });
      return;
    }

    const report = await CommentReport.create({
      comment_id,
      reporter_id: req.user?.id,
      reason,
      details,
    });

    res.status(201).json({ success: true, data: report });
  } catch (err: any) {
    res.status(400).json({ success: false, message: "Failed to create comment report", error: err.message });
  }
};

//@desc  Get all comment reports
//GET /api/v1/report/comment
//@access Private
export const getCommentReports = async (req: Request, res: Response) => {
  try {
    const reports = await CommentReport.find()
      .populate('comment_id', 'content')
      .populate('reporter_id', 'name')
      .lean();

    res.status(200).json({ success: true, data: reports });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to fetch comment reports", error: err.message });
  }
};

//@desc  Get a specific comment report by ID
//GET /api/v1/report/comment/:reportId
//@access Private
export const getCommentReport = async (req: Request, res: Response) => {
  try {
    const report = await CommentReport.findById(req.params.reportId)
      .populate('comment_id', 'content')
      .populate('reporter_id', 'name email')
      .lean();

    if (!report) {
      res.status(404).json({ success: false, message: "Comment report not found" });
      return;
    }

    res.status(200).json({ success: true, data: report });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to fetch comment report", error: err.message });
  }
};
