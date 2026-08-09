import express from "express";
import { getPackages } from "../controllers/package.controller.js";

const router = express.Router();

router.get("/", getPackages);

export default router;