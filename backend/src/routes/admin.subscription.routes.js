import express from "express";

import {
    getSubscriptions
} from "../controllers/subscription.controller.js";

import {
    authenticateAdmin
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
    "/",
    authenticateAdmin,
    getSubscriptions
);

export default router;