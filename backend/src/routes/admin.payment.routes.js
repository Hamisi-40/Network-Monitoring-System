import express from "express";

import { getPayments } from "../controllers/payment.controller.js";
import { authenticateAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();
router.get("/", authenticateAdmin, getPayments);

export default router;