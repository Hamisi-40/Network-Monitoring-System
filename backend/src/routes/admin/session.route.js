// Import Express Router
import { Router } from "express";

// Import admin session controller
import { getAllSessions, getSessionById, updateSessionStatus } from "../../controllers/admin/session.controller.js";

// Import admin authentication middleware
import { adminAuth } from "../../middlewares/adminAuth.middleware.js";

const router = Router();

// Protect all session routes
router.use(adminAuth);

// Get every internet session
router.get("/", getAllSessions);

// Get one session by ID
router.get("/:id", getSessionById);

// Update one session status
router.patch("/:id/status", updateSessionStatus);

export default router;