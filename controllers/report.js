const ReportForum = require("../models/ForumReport");
const CommentReport = require("../models/CommentReport");
const Comment = require("../models/Comment")
const Forum = require("../models/Forum")

//@desc  Create a report
//POST /api/v1/forum/:forumId/report
//@access Private
exports.createReport = async (req, res) => {
  try {
    const { reason, details } = req.body;
    const forum_id = req.params.forumId;
    if (!forum_id || !reason) {
      return res.status(400).json({ success: false, message: "forum_id and reason are required" });
    }

    const exists = await Forum.exists({ _id: req.params.forumId });
    if (!exists) {
      return res.status(404).json({ success: false, message: "Forum not found" });
    }

    const newReport = await ReportForum.create({
      forum_id,
      reporter_id: req.user.id,
      reason,
      details,
      status: "pending",
    });

    res.status(201).json({ success: true, data: newReport });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to create report", error: err.message });
  }
};


//@desc  get all report
//GET /api/v1/report/forum
//@access Private
exports.getReports = async (req, res) => {
  try {
    const reports = await ReportForum.find()
      .populate('forum_id', 'title')
      .populate('reporter_id', 'name')
      .lean();

    res.status(200).json({ success: true, data: reports });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch reports", error: err.message });
  }
};

//@desc  get all report
//GET /api/v1/report/:reportId
//@access Private
exports.getReport = async (req, res) => {
  try {
    const report = await ReportForum.findById(req.params.reportId)
      .populate('forum_id', 'title content')
      .populate('reporter_id', 'name email')
      .lean();

    if (!report) return res.status(404).json({ success: false, message: "Report not found" });

    res.status(200).json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch report", error: err.message });
  }
};

//@desc  Create a comment report
//POST /api/v1/comment/:commentId/report
//@access Private
exports.createCommentReport = async (req, res) => {
  try {
    const { reason, details } = req.body;
    const comment_id = req.params.commentId;

    if (!comment_id || !reason) {
      return res.status(400).json({ success: false, message: "comment_id and reason are required" });
    }

    const exists = await Comment.exists({ _id: req.params.commentId });
    if (!exists) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const newReport = await CommentReport.create({
      comment_id,
      reporter_id: req.user.id,
      reason,
      details,
      status: "pending",
    });

    res.status(201).json({ success: true, data: newReport });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to create comment report", error: err.message });
  }
};

//@desc  Get all comment reports
//GET /api/v1/report/comment
//@access Private
exports.getCommentReports = async (req, res) => {
  try {
    const reports = await CommentReport.find()
      .populate('comment_id', 'content')
      .populate('reporter_id', 'name')
      .lean();

    res.status(200).json({ success: true, data: reports });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch comment reports", error: err.message });
  }
};

//@desc  Get a specific comment report by ID
//GET /api/v1/report/comment/:reportId
//@access Private
exports.getCommentReport = async (req, res) => {
  try {
    const report = await CommentReport.findById(req.params.reportId)
      .populate('comment_id', 'content')
      .populate('reporter_id', 'name email')
      .lean();

    if (!report) return res.status(404).json({ success: false, message: "Comment report not found" });

    res.status(200).json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch comment report", error: err.message });
  }
};
