const ReportForum = require("../models/Report");

//@desc  Create a report
//DELETE /api/v1/forum/:forumId/report
//@access Private
exports.createReport = async (req, res) => {
  try {
    const { reason, details } = req.body;
    const forum_id = req.params.forumId;
    if (!forum_id || !reason) {
      return res.status(400).json({ success: false, message: "forum_id and reason are required" });
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
//GET /api/v1/report
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
