import express from "express";

import { getCustomers } from "../controllers/customer.controller.js";
import { authenticateAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
    "/",
    authenticateAdmin,
    getCustomers
);

export default router;