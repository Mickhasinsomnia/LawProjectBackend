import express from "express"
import { protect, authorize } from "../middleware/auth.js"
import { getAllUser, getUserById, updateRole, updateUser, getDashboardStats, deleteuser } from "../controllers/admin.js" // Import getDashboardStats

const router = express.Router()

router.get("/user", protect, authorize("admin"), getAllUser)
router.get("/user/:id", protect, authorize("admin"), getUserById)
router.put("/user/:id/role", protect, authorize("admin"), updateRole)
router.put("/user/:id", protect, authorize("admin"), updateUser)
router.get("/dashboard/stats", protect, authorize("admin"), getDashboardStats) // New route for dashboard statistics
router.delete('/user/delete/:id',protect,authorize("admin"),deleteuser)
export default router
