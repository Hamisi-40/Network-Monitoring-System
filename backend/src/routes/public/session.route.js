// Import Express Router
import { Router } from "express";

// Import session controller
import { getSession } from "../../controllers/public/session.controller.js";

const router = Router();

// Get a customer's internet session
router.get("/:id", getSession);

export default router;