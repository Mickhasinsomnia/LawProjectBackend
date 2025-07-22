import express from "express"
import { protect, authorize } from "../middleware/auth.js"
import { getAllUser, getUserById, updateRole, updateUser, getDashboardStats } from "../controllers/admin.js" // Import getDashboardStats

const router = express.Router()

router.get("/user", protect, authorize("admin"), getAllUser)
router.get("/user/:id", protect, authorize("admin"), getUserById)
router.put("/user/:id/role", protect, authorize("admin"), updateRole)
router.put("/user/:id", protect, authorize("admin"), updateUser)
router.get("/dashboard/stats", protect, authorize("admin"), getDashboardStats) // New route for dashboard statistics

export default router
