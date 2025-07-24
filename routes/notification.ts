import express from "express";
import {getNotificationsByUser,createNotification,markAsRead,deleteNotification} from "../controllers/notification.js"; // <- no .js
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getNotificationsByUser);
router.post("/", protect, createNotification);
router.put("/:id/read", protect, markAsRead);
router.delete("/:id", protect, deleteNotification);

export default router;
