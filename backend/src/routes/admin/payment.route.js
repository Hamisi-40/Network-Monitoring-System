// Import Express Router
import { Router } from "express";

// Import admin payment controller
import { markPaymentSuccessful } from "../../controllers/admin/payment.controller.js";

// Create router
const router = Router();

// TEMPORARY test route:
// Mark a payment as successful using its transaction reference
router.patch("/:reference/success", markPaymentSuccessful);

export default router;