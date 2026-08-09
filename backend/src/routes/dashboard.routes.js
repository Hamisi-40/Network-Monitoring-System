import express from "express";

import { getDashboard } from "../controllers/dashboard.controller.js";
import { authenticateAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authenticateAdmin, getDashboard);

export default router;