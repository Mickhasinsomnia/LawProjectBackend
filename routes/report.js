const express = require("express");
const router = express.Router();
const {
  createReport,
  getReports,
  getReport,
} = require("../controllers/report");
const { protect, authorize } = require("../middleware/auth");


router.post("/forum/:forumId/report", protect, createReport);


router.get("/report", protect, authorize("admin"), getReports);


router.get("/report/:reportId", protect, authorize("admin"), getReport);



module.exports = router;
