// Import Express Router
import { Router } from "express";

// Import administrator report controller functions
import {
    getRevenueReport,
    getPaymentsReport,
    getSessionsReport
} from "../../controllers/admin/report.controller.js";

// Import JWT authentication middleware
import { adminAuth } from "../../middlewares/adminAuth.middleware.js";

const router = Router();

// Every reports API must be accessible only by authenticated admins
router.use(adminAuth);

// Revenue statistics
router.get("/revenue", getRevenueReport);

// Payment statistics
router.get("/payments", getPaymentsReport);

// Internet-session statistics
router.get("/sessions", getSessionsReport);

export default router;