import express from "express";
import { createPackage, updatePackage, deactivatePackage } from "../controllers/package.controller.js";

import { authenticateAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authenticateAdmin, createPackage);
router.put("/:id", authenticateAdmin, updatePackage);
router.delete("/:id", authenticateAdmin, deactivatePackage);

export default router;