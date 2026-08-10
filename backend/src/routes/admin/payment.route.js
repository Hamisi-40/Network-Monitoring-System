// Import Express Router
import { Router } from "express";

// Import admin payment controller
import { markPaymentSuccessful, getAllPayments, getPaymentById } from "../../controllers/admin/payment.controller.js";

// Import admin authentication middleware
import { adminAuth } from "../../middlewares/adminAuth.middleware.js";

// Create router
const router = Router();

// Every payment admin route below requires authentication
router.use(adminAuth);

// Get every payment
router.get("/", getAllPayments);

// TEMPORARY test route:
// Mark a payment as successful using its transaction reference
router.patch("/:reference/success", markPaymentSuccessful);

// Get one payment by ID
router.get("/:id", getPaymentById);

export default router;