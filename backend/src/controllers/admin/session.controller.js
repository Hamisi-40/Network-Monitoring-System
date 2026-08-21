// Import PostgreSQL connection pool
import { pool } from "../../database/database.js";

// Get all internet sessions for the admin dashboard
const getAllSessions = async (req, res) => {
    try {
        // Fetch session data together with package and payment details
        const result = await pool.query(
            `
            SELECT
                internet_sessions.id,
                internet_sessions.started_at,
                internet_sessions.expires_at,
                internet_sessions.status,
                internet_sessions.created_at,

                packages.id AS package_id,
                packages.name AS package_name,
                packages.duration_minutes,
                packages.speed,

                payments.id AS payment_id,
                payments.transaction_reference,
                payments.phone_number,
                payments.payment_method,
                payments.amount,
                payments.paid_at

            FROM internet_sessions

            JOIN packages
                ON internet_sessions.package_id = packages.id

            JOIN payments
                ON internet_sessions.payment_id = payments.id

            ORDER BY internet_sessions.id DESC
            `
        );

        // Return all session records
        res.status(200).json({
            success: true,
            sessions: result.rows
        });

    } catch (error) {
        // Log the actual backend error
        console.error("Error fetching admin sessions:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch sessions"
        });
    }
};

// Get one internet session by ID
const getSessionById = async (req, res) => {
    try {
        // Read session ID from the URL
        const { id } = req.params;

        // Fetch session together with payment and package details
        const result = await pool.query(
            `
            SELECT
                internet_sessions.id,
                internet_sessions.started_at,
                internet_sessions.expires_at,
                internet_sessions.status,
                internet_sessions.created_at,

                packages.id AS package_id,
                packages.name AS package_name,
                packages.duration_minutes,
                packages.speed,

                payments.id AS payment_id,
                payments.transaction_reference,
                payments.phone_number,
                payments.payment_method,
                payments.amount,
                payments.status AS payment_status,
                payments.paid_at

            FROM internet_sessions

            JOIN packages
                ON internet_sessions.package_id = packages.id

            JOIN payments
                ON internet_sessions.payment_id = payments.id

            WHERE internet_sessions.id = $1
            LIMIT 1
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

        // Return full session details
        res.status(200).json({
            success: true,
            session: result.rows[0]
        });

    } catch (error) {
        // Log actual backend error
        console.error("Error fetching session:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch session"
        });
    }
};

// Update the status of an internet session
const updateSessionStatus = async (req, res) => {
    try {
        // Get session ID from the URL
        const { id } = req.params;

        // Get the requested new status from the admin app
        const { status } = req.body;

        // Allow only known session states
        const allowedStatuses = [
            "active",
            "suspended",
            "expired",
            "failed",
            "pending_activation"
        ];

        // Reject unsupported status values
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid session status"
            });
        }

        // Update the session status in PostgreSQL
        const result = await pool.query(
            `
            UPDATE internet_sessions
            SET status = $1
            WHERE id = $2
            RETURNING *
            `,
            [status, id]
        );

        // Stop if the session does not exist
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Session not found"
            });
        }

        // Return the updated session
        res.status(200).json({
            success: true,
            message: "Session status updated successfully",
            session: result.rows[0]
        });

    } catch (error) {
        // Log the real backend error
        console.error(
            "Error updating session status:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to update session status"
        });
    }
};

export { getAllSessions, getSessionById, updateSessionStatus };