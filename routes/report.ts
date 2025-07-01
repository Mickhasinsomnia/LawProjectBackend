import express from "express";
const router = express.Router();
import {
  createReport,
  getReports,
  getReport,
  createCommentReport,
  getCommentReports,
  getCommentReport
} from "../controllers/report.js";
import { protect, authorize } from "../middleware/auth.js";


router.post("/forum/:forumId/report", protect, createReport);


router.get("/report/forum", protect, authorize("admin"), getReports);


router.get("/report/forum/:reportId", protect, authorize("admin"), getReport);

router.post("/comment/:commentId/report",protect,createCommentReport)

router.get("/report/comment", protect, authorize("admin"), getCommentReports);
router.get("/report/comment/commentId", protect, authorize("admin"), getCommentReport);

export default router;
