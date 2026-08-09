// Import PostgreSQL connection pool
import { pool } from "../../database/database.js";

// Import crypto to generate unique transaction references
import crypto from "crypto";

// Initiate a new payment
const initiatePayment = async (req, res) => {
    try {
        // Get only the information the customer is allowed to send
        const {
            package_id,
            payment_method,
            phone_number
        } = req.body;

        // Validate required fields
        if (!package_id || !payment_method || !phone_number) {
            return res.status(400).json({
                success: false,
                message: "Package, payment method and phone number are required"
            });
        }

        // Find the selected package from PostgreSQL
        const packageResult = await pool.query(
            `
            SELECT *
            FROM packages
            WHERE id = $1
            AND is_active = TRUE
            `,
            [package_id]
        );

        // Stop if the package does not exist or is inactive
        if (packageResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Selected package is not available"
            });
        }

        // Get the package returned from PostgreSQL
        const selectedPackage = packageResult.rows[0];

        // Generate our own unique transaction reference
        const transactionReference =
            "PAY-" + crypto.randomUUID();

        // Create a pending payment record
        const paymentResult = await pool.query(
            `
            INSERT INTO payments (
                package_id,
                phone_number,
                payment_method,
                amount,
                transaction_reference,
                status
            )
            VALUES ($1, $2, $3, $4, $5, 'pending')
            RETURNING *
            `,
            [
                package_id,
                phone_number,
                payment_method,
                selectedPackage.price,
                transactionReference
            ]
        );

        // Get the newly created payment
        const payment = paymentResult.rows[0];

        // For now, we only create the payment record.
        // Later this is where we will call the real mobile-money provider API.
        res.status(201).json({
            success: true,
            message: "Payment initiated successfully",
            payment: {
                id: payment.id,
                transaction_reference: payment.transaction_reference,
                status: payment.status,
                amount: payment.amount,
                phone_number: payment.phone_number,
                payment_method: payment.payment_method,
                package: {
                    id: selectedPackage.id,
                    name: selectedPackage.name,
                    duration_minutes: selectedPackage.duration_minutes
                }
            }
        });

    } catch (error) {
        // Log actual backend error
        console.error("Error initiating payment:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to initiate payment"
        });
    }
};

// Get the current status of a payment
const getPaymentStatus = async (req, res) => {
    try {
        // Get transaction reference from the URL
        const { reference } = req.params;

        // Find the payment using our unique transaction reference
        const result = await pool.query(
            `
            SELECT
                id,
                transaction_reference,
                status,
                amount,
                payment_method,
                phone_number,
                paid_at
            FROM payments
            WHERE transaction_reference = $1
            `,
            [reference]
        );

        // Stop if no matching payment exists
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        // Return the current payment status
        res.status(200).json({
            success: true,
            payment: result.rows[0]
        });

    } catch (error) {
        // Log the real backend error
        console.error("Error checking payment status:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to check payment status"
        });
    }
};


export { initiatePayment, getPaymentStatus };