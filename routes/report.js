const express = require("express");
const router = express.Router();
const {
  createReport,
  getReports,
  getReport,
  createCommentReport,
  getCommentReports,
  getCommentReport
} = require("../controllers/report");
const { protect, authorize } = require("../middleware/auth");


router.post("/forum/:forumId/report", protect, createReport);


router.get("/report/forum", protect, authorize("admin"), getReports);


router.get("/report/forum/:reportId", protect, authorize("admin"), getReport);

router.post("/comment/:commentId/report",protect,createCommentReport)

router.get("/report/comment", protect, authorize("admin"), getCommentReports);
router.get("/report/comment/commentId", protect, authorize("admin"), getCommentReport);

module.exports = router;
