// Import PostgreSQL database pool
import { pool } from "../../database/database.js";

// Create a new internet package
const createPackage = async (req, res) => {
    try {
        // Get package information from admin app
        const { name, price, duration_minutes } = req.body;

        // Validate required fields
        if (!name || !price || !duration_minutes) {
            return res.status(400).json({
                success: false,
                message: "Name, price and duration are required"
            });
        }

        // Insert package into PostgreSQL
        const result = await pool.query(
            `
            INSERT INTO packages (name, price, duration_minutes)
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [name, price, duration_minutes]
        );

        // Return created package
        res.status(201).json({
            success: true,
            message: "Package created successfully",
            package: result.rows[0]
        });

    } catch (error) {
        // Log server/database error
        console.error("Error creating package:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create package"
        });
    }
};

// Update an existing internet package
const updatePackage = async (req, res) => {
    try {
        // Get the package ID from the URL
        const { id } = req.params;

        // Get updated package information from the admin app
        const { name, price, duration_minutes } = req.body;

        // Validate required fields
        if (!name || !price || !duration_minutes) {
            return res.status(400).json({
                success: false,
                message: "Name, price and duration are required"
            });
        }

        // Update the package and return the updated record
        const result = await pool.query(
            `
            UPDATE packages
            SET name = $1,
                price = $2,
                duration_minutes = $3
            WHERE id = $4
            RETURNING *
            `,
            [name, price, duration_minutes, id]
        );

        // Check whether the requested package actually existed
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Package not found"
            });
        }

        // Send updated package back to admin app
        res.status(200).json({
            success: true,
            message: "Package updated successfully",
            package: result.rows[0]
        });

    } catch (error) {
        // Log database/server error
        console.error("Error updating package:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to update package"
        });
    }
};

// Delete an internet package
const deletePackage = async (req, res) => {
    try {
        // Get package ID from the URL
        const { id } = req.params;

        // Delete the package from PostgreSQL
        const result = await pool.query(
            `
            DELETE FROM packages
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );

        // Check whether the package existed
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Package not found"
            });
        }

        // Confirm deletion
        res.status(200).json({
            success: true,
            message: "Package deleted successfully"
        });

    } catch (error) {
        // Log database/server error
        console.error("Error deleting package:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to delete package"
        });
    }
};


export { createPackage, updatePackage, deletePackage };