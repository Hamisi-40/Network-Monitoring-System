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

export { markPaymentSuccessful };