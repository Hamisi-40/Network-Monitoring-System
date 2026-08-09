// Import the PostgreSQL connection pool
import { pool } from "../../database/database.js";

// Get packages that customers are currently allowed to purchase
const getPackages = async (req, res) => {
    try {

        // Multiline SQL must be inside backticks: ` `
        const result = await pool.query(`
            SELECT *
            FROM packages
            WHERE is_active = TRUE

            -- Package must have started, or have no starting restriction
            AND (
                available_from IS NULL
                OR available_from <= CURRENT_TIMESTAMP
            )

            -- Package must not have expired, or have no ending restriction
            AND (
                available_until IS NULL
                OR available_until >= CURRENT_TIMESTAMP
            )

            ORDER BY id ASC
        `);

        // Return available packages to the customer
        res.status(200).json({
            success: true,
            packages: result.rows
        });

    } catch (error) {
        // Display the actual error in the backend terminal
        console.error("Error fetching packages:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch packages"
        });
    }
};

export { getPackages };