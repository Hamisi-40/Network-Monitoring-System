// Import PostgreSQL connection pool
import { pool } from "../../database/database.js";

// TEMPORARY: Simulate successful payment and create internet session
const markPaymentSuccessful = async (req, res) => {
    // Get a dedicated database client so we can use a transaction
    const client = await pool.connect();

    try {
        // Get transaction reference from URL
        const { reference } = req.params;

        // Start PostgreSQL transaction
        await client.query("BEGIN");

        // Find the payment together with its package duration
        const paymentResult = await client.query(
            `
            SELECT
                payments.*,
                packages.duration_minutes
            FROM payments
            JOIN packages
                ON payments.package_id = packages.id
            WHERE payments.transaction_reference = $1
            `,
            [reference]
        );

        // Stop if payment does not exist
        if (paymentResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        const payment = paymentResult.rows[0];

        // Prevent the same payment from creating multiple sessions
        if (payment.status === "successful") {
            await client.query("ROLLBACK");

            return res.status(400).json({
                success: false,
                message: "Payment has already been processed"
            });
        }

        // Mark payment as successful
        await client.query(
            `
            UPDATE payments
            SET
                status = 'successful',
                paid_at = CURRENT_TIMESTAMP
            WHERE id = $1
            `,
            [payment.id]
        );

        // Create the internet session.
        // PostgreSQL adds the package duration in minutes to the current time.
        const sessionResult = await client.query(
            `
            INSERT INTO internet_sessions (
                payment_id,
                package_id,
                started_at,
                expires_at,
                status
            )
            VALUES (
                $1,
                $2,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP + ($3 * INTERVAL '1 minute'),
                'active'
            )
            RETURNING *
            `,
            [
                payment.id,
                payment.package_id,
                payment.duration_minutes
            ]
        );

        // Save both changes permanently
        await client.query("COMMIT");

        // Return the newly created session
        res.status(200).json({
            success: true,
            message: "Payment successful and internet session created",
            session: sessionResult.rows[0]
        });

    } catch (error) {
        // Undo all database changes if anything fails
        await client.query("ROLLBACK");

        console.error(
            "Error processing successful payment:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to process successful payment"
        });

    } finally {
        // Return database connection to the pool
        client.release();
    }
};

// Get all payment records for the admin dashboard
const getAllPayments = async (req, res) => {
    try {
        // Fetch payments together with their related package information
        const result = await pool.query(
            `
            SELECT
                payments.id,
                payments.transaction_reference,
                payments.phone_number,
                payments.payment_method,
                payments.amount,
                payments.status,
                payments.created_at,
                payments.paid_at,

                packages.id AS package_id,
                packages.name AS package_name,
                packages.duration_minutes,
                packages.speed

            FROM payments

            JOIN packages
                ON payments.package_id = packages.id

            ORDER BY payments.id DESC
            `
        );

        // Return all payment records
        res.status(200).json({
            success: true,
            payments: result.rows
        });

    } catch (error) {
        // Log the real backend error
        console.error("Error fetching admin payments:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch payments"
        });
    }
};

// Get one payment by its ID
const getPaymentById = async (req, res) => {
    try {
        // Read payment ID from the URL
        const { id } = req.params;

        // Fetch payment together with package and session information
        const result = await pool.query(
            `
            SELECT
                payments.id,
                payments.transaction_reference,
                payments.phone_number,
                payments.payment_method,
                payments.amount,
                payments.status,
                payments.created_at,
                payments.paid_at,

                packages.id AS package_id,
                packages.name AS package_name,
                packages.duration_minutes,
                packages.speed,

                internet_sessions.id AS session_id,
                internet_sessions.started_at,
                internet_sessions.expires_at,
                internet_sessions.status AS session_status

            FROM payments

            JOIN packages
                ON payments.package_id = packages.id

            LEFT JOIN internet_sessions
                ON internet_sessions.payment_id = payments.id

            WHERE payments.id = $1
            LIMIT 1
            `,
            [id]
        );

        // Stop if payment does not exist
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        // Return full payment details
        res.status(200).json({
            success: true,
            payment: result.rows[0]
        });

    } catch (error) {
        // Log actual backend error
        console.error("Error fetching payment:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch payment"
        });
    }
};

// Get cash-payment requests waiting for administrator confirmation
const getCashRequests = async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
                payments.id,
                payments.transaction_reference,
                payments.phone_number,
                payments.amount,
                payments.status,
                payments.created_at,

                packages.id AS package_id,
                packages.name AS package_name,
                packages.duration_minutes,
                packages.speed

            FROM payments

            JOIN packages
                ON payments.package_id = packages.id

            WHERE payments.payment_method = 'cash'

            ORDER BY payments.id DESC
            `
        );

        res.status(200).json({
            success: true,
            cash_requests: result.rows
        });

    } catch (error) {
        console.error(
            "Error fetching cash requests:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch cash payment requests"
        });
    }
};

// Confirm that the administrator physically received the cash payment
const confirmCashPayment = async (req, res) => {

    // Use one PostgreSQL client so payment + session creation
    // happen inside the same database transaction.
    const client = await pool.connect();

    try {
        const { reference } = req.params;

        await client.query("BEGIN");

        // Find the cash request and package duration
        const paymentResult = await client.query(
            `
            SELECT
                payments.*,
                packages.duration_minutes

            FROM payments

            JOIN packages
                ON payments.package_id = packages.id

            WHERE payments.transaction_reference = $1
            AND payments.payment_method = 'cash'
            `,
            [reference]
        );

        if (paymentResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Cash payment request not found"
            });
        }

        const payment = paymentResult.rows[0];

        // Only waiting cash requests can be confirmed
        if (
            payment.status !==
            "awaiting_cash_confirmation"
        ) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                success: false,
                message:
                    "Cash payment has already been processed"
            });
        }

        // Mark payment successful
        await client.query(
            `
            UPDATE payments
            SET
                status = 'successful',
                paid_at = CURRENT_TIMESTAMP
            WHERE id = $1
            `,
            [payment.id]
        );

        // Create the customer's internet session
        const sessionResult = await client.query(
            `
            INSERT INTO internet_sessions (
                payment_id,
                package_id,
                started_at,
                expires_at,
                status
            )
            VALUES (
                $1,
                $2,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
                    + ($3 * INTERVAL '1 minute'),
                'active'
            )
            RETURNING *
            `,
            [
                payment.id,
                payment.package_id,
                payment.duration_minutes
            ]
        );

        await client.query("COMMIT");

        res.status(200).json({
            success: true,
            message:
                "Cash payment confirmed and internet session created",
            payment_reference:
                payment.transaction_reference,
            session: sessionResult.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error(
            "Error confirming cash payment:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to confirm cash payment"
        });

    } finally {
        client.release();
    }
};

// Keep your existing temporary success function too

export { markPaymentSuccessful, getAllPayments, getPaymentById, getCashRequests, confirmCashPayment };