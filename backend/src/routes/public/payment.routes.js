// Import Express Router
import { Router } from "express";

// Import payment controller
import { initiatePayment, getPaymentStatus } from "../../controllers/public/payment.controller.js";

// Create router
const router = Router();

// Customer starts a payment here
router.post("/initiate", initiatePayment);

// Check the current status of a payment
router.get("/:reference/status", getPaymentStatus);

export default router;