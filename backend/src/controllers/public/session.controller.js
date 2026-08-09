// Import PostgreSQL connection pool
import { pool } from "../../database/database.js";

// Get internet session details
const getSession = async (req, res) => {
    try {
        // Get session ID from the URL
        const { id } = req.params;

        // Fetch session together with package and payment details
        const result = await pool.query(
            `
            SELECT
                internet_sessions.id,
                internet_sessions.started_at,
                internet_sessions.expires_at,
                internet_sessions.status,
                packages.name AS package_name,
                packages.duration_minutes,
                payments.amount,
                payments.transaction_reference
            FROM internet_sessions

            JOIN packages
                ON internet_sessions.package_id = packages.id

            JOIN payments
                ON internet_sessions.payment_id = payments.id

            WHERE internet_sessions.id = $1
            `,
            [id]
        );

        // Stop if session does not exist
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Session not found"
            });
        }

        // Return session information to captive portal
        res.status(200).json({
            success: true,
            session: result.rows[0]
        });

    } catch (error) {
        // Log backend error
        console.error("Error fetching session:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch session"
        });
    }
};

export { getSession };