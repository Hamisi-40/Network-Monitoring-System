import express from "express";
import { checkAccess } from "../controllers/access.controller.js";

const router = express.Router();

router.get("/check", checkAccess);

export default router;