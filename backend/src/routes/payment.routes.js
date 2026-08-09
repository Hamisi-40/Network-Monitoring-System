import express from "express";

import { createPayment, confirmPayment } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/", createPayment);

router.post("/:id/confirm", confirmPayment);

export default router;