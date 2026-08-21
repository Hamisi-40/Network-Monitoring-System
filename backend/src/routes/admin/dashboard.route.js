// Import Express Router
import { Router } from "express";

// Import dashboard controller
import { getDashboardSummary } from "../../controllers/admin/dashboard.controller.js";

// Import admin authentication middleware
import { adminAuth } from "../../middlewares/adminAuth.middleware.js";

const router = Router();

// Protect all dashboard routes
router.use(adminAuth);

// Return dashboard summary statistics
router.get("/", getDashboardSummary);

export default router;