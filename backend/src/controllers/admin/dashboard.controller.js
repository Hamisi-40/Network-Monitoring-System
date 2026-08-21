// Import PostgreSQL connection pool
import { pool } from "../../database/database.js";

// Get summary statistics for the admin dashboard
const getDashboardSummary = async (req, res) => {
    try {
        // Run all dashboard queries together for better efficiency
        const [
            packagesResult,
            paymentsResult,
            successfulPaymentsResult,
            pendingPaymentsResult,
            activeSessionsResult,
            expiredSessionsResult,
            revenueResult
        ] = await Promise.all([
            // Count all packages
            pool.query(`
                SELECT COUNT(*) AS total
                FROM packages
            `),

            // Count all payment records
            pool.query(`
                SELECT COUNT(*) AS total
                FROM payments
            `),

            // Count successful payments
            pool.query(`
                SELECT COUNT(*) AS total
                FROM payments
                WHERE status = 'successful'
            `),

            // Count pending payments
            pool.query(`
                SELECT COUNT(*) AS total
                FROM payments
                WHERE status = 'pending'
            `),

            // Count sessions that are currently active
            pool.query(`
                SELECT COUNT(*) AS total
                FROM internet_sessions
                WHERE status = 'active'
                AND expires_at > CURRENT_TIMESTAMP
            `),

            // Count sessions whose expiry time has passed
            pool.query(`
                SELECT COUNT(*) AS total
                FROM internet_sessions
                WHERE expires_at <= CURRENT_TIMESTAMP
            `),

            // Sum revenue only from successful payments
            pool.query(`
                SELECT COALESCE(SUM(amount), 0) AS total
                FROM payments
                WHERE status = 'successful'
            `)
        ]);

        // Build a clean dashboard response
        res.status(200).json({
            success: true,
            dashboard: {
                total_packages: Number(packagesResult.rows[0].total),
                total_payments: Number(paymentsResult.rows[0].total),
                successful_payments: Number(
                    successfulPaymentsResult.rows[0].total
                ),
                pending_payments: Number(
                    pendingPaymentsResult.rows[0].total
                ),
                active_sessions: Number(
                    activeSessionsResult.rows[0].total
                ),
                expired_sessions: Number(
                    expiredSessionsResult.rows[0].total
                ),
                total_revenue: Number(
                    revenueResult.rows[0].total
                )
            }
        });

    } catch (error) {
        // Log the real backend error
        console.error("Error fetching dashboard summary:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard summary"
        });
    }
};

export { getDashboardSummary };