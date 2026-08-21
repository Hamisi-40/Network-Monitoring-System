// Import PostgreSQL connection pool
import { pool } from "../../database/database.js";


// Get revenue report from successful payments
const getRevenueReport = async (req, res) => {
    try {
        // Calculate total successful revenue
        // and group revenue by payment date.
        const result = await pool.query(
            `
            SELECT
                DATE(paid_at) AS date,
                COUNT(*) AS successful_payments,
                SUM(amount) AS revenue

            FROM payments

            WHERE status = 'successful'
            AND paid_at IS NOT NULL

            GROUP BY DATE(paid_at)

            ORDER BY date DESC
            `
        );

        // Calculate the overall successful revenue
        const totalResult = await pool.query(
            `
            SELECT
                COALESCE(SUM(amount), 0) AS total_revenue

            FROM payments

            WHERE status = 'successful'
            `
        );

        // Return revenue report
        res.status(200).json({
            success: true,

            total_revenue: Number(
                totalResult.rows[0].total_revenue
            ),

            revenue_by_date: result.rows
        });

    } catch (error) {
        // Log actual backend/database error
        console.error(
            "Error fetching revenue report:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch revenue report"
        });
    }
};


// Get payment statistics report
const getPaymentsReport = async (req, res) => {
    try {
        // Group payments by their current status
        const statusResult = await pool.query(
            `
            SELECT
                status,
                COUNT(*) AS total,
                COALESCE(SUM(amount), 0) AS amount

            FROM payments

            GROUP BY status

            ORDER BY status ASC
            `
        );

        // Group payments by mobile-money method
        const methodResult = await pool.query(
            `
            SELECT
                payment_method,
                COUNT(*) AS total_transactions,
                COALESCE(SUM(amount), 0) AS total_amount

            FROM payments

            GROUP BY payment_method

            ORDER BY total_transactions DESC
            `
        );

        // Return payment statistics
        res.status(200).json({
            success: true,

            by_status: statusResult.rows,

            by_payment_method: methodResult.rows
        });

    } catch (error) {
        // Log actual backend/database error
        console.error(
            "Error fetching payments report:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch payments report"
        });
    }
};


// Get internet-session statistics report
const getSessionsReport = async (req, res) => {
    try {
        // Count currently active sessions.
        // We also check expires_at so an old session marked active
        // is not counted as currently active.
        const activeResult = await pool.query(
            `
            SELECT COUNT(*) AS total

            FROM internet_sessions

            WHERE status = 'active'
            AND expires_at > CURRENT_TIMESTAMP
            `
        );

        // Count sessions whose package time has already expired
        const expiredResult = await pool.query(
            `
            SELECT COUNT(*) AS total

            FROM internet_sessions

            WHERE expires_at <= CURRENT_TIMESTAMP
            `
        );

        // Group sessions by their stored status
        const statusResult = await pool.query(
            `
            SELECT
                status,
                COUNT(*) AS total

            FROM internet_sessions

            GROUP BY status

            ORDER BY status ASC
            `
        );

        // Find which packages are being used most
        const packageResult = await pool.query(
            `
            SELECT
                packages.id AS package_id,
                packages.name AS package_name,
                COUNT(internet_sessions.id) AS total_sessions

            FROM internet_sessions

            JOIN packages
                ON internet_sessions.package_id = packages.id

            GROUP BY
                packages.id,
                packages.name

            ORDER BY total_sessions DESC
            `
        );

        // Return session report
        res.status(200).json({
            success: true,

            active_sessions: Number(
                activeResult.rows[0].total
            ),

            expired_sessions: Number(
                expiredResult.rows[0].total
            ),

            by_status: statusResult.rows,

            by_package: packageResult.rows
        });

    } catch (error) {
        // Log actual backend/database error
        console.error(
            "Error fetching sessions report:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch sessions report"
        });
    }
};


// Export all administrator report controllers
export {
    getRevenueReport,
    getPaymentsReport,
    getSessionsReport
};