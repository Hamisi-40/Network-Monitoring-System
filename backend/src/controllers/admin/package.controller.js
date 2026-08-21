// Import PostgreSQL database pool
import { pool } from "../../database/database.js";

// Create a new internet package API
const createPackage = async (req, res) => {
    try {
        // Get package information from admin app
        const { name, price, duration_minutes, speed } = req.body;

        // Validate required fields
        if (!name || !price || !duration_minutes || !speed) {
            return res.status(400).json({
                success: false,
                message: "Name, price and duration are required"
            });
        }

        // Insert package into PostgreSQL
        const result = await pool.query(
            `
            INSERT INTO packages (name, price, duration_minutes, speed)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `,
            [name, price, duration_minutes, speed]
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

// Update an existing internet package API
const updatePackage = async (req, res) => {
    try {
        // Get the package ID from the URL
        const { id } = req.params;

        // Get updated package information from the admin app
        const { name, price, duration_minutes, speed } = req.body;

        // Validate required fields
        if (!name || !price || !duration_minutes || !speed) {
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
                duration_minutes = $3,
                speed = $4
            WHERE id = $5
            RETURNING *
            `,
            [name, price, duration_minutes, speed, id]
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

// Delete an internet package API
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

// Get all packages for the administrator
// Unlike the public API, this returns active and inactive packages.
const getAllPackages = async (req, res) => {
    try {
        // Fetch every package so the admin can manage all of them
        const result = await pool.query(
            `
            SELECT
                id,
                name,
                price,
                duration_minutes,
                speed,
                is_active,
                available_from,
                available_until
            FROM packages
            ORDER BY id DESC
            `
        );

        // Return all packages
        res.status(200).json({
            success: true,
            packages: result.rows
        });

    } catch (error) {
        // Log the actual backend/database error
        console.error("Error fetching admin packages:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch packages"
        });
    }
};


// Activate or deactivate a package
const changePackageStatus = async (req, res) => {
    try {
        // Get package ID from the URL
        const { id } = req.params;

        // Admin sends true or false
        const { is_active } = req.body;

        // Validate that the value is really boolean
        if (typeof is_active !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "is_active must be true or false"
            });
        }

        // Update only the package status
        const result = await pool.query(
            `
            UPDATE packages
            SET is_active = $1
            WHERE id = $2
            RETURNING *
            `,
            [is_active, id]
        );

        // Stop if package does not exist
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Package not found"
            });
        }

        // Return updated package
        res.status(200).json({
            success: true,
            message: is_active
                ? "Package activated successfully"
                : "Package deactivated successfully",
            package: result.rows[0]
        });

    } catch (error) {
        // Log actual server/database error
        console.error("Error changing package status:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to change package status"
        });
    }
};

// Set or update a package availability period
const schedulePackage = async (req, res) => {
    try {
        // Get package ID from the URL
        const { id } = req.params;

        // Get optional start and end times from the admin app
        const {
            available_from,
            available_until
        } = req.body;

        // If both dates are provided, make sure the ending time is later
        if (
            available_from &&
            available_until &&
            new Date(available_until) <= new Date(available_from)
        ) {
            return res.status(400).json({
                success: false,
                message: "available_until must be later than available_from"
            });
        }

        // Update the package schedule
        const result = await pool.query(
            `
            UPDATE packages
            SET
                available_from = $1,
                available_until = $2
            WHERE id = $3
            RETURNING *
            `,
            [
                available_from || null,
                available_until || null,
                id
            ]
        );

        // Stop if package does not exist
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Package not found"
            });
        }

        // Return the scheduled package
        res.status(200).json({
            success: true,
            message: "Package schedule updated successfully",
            package: result.rows[0]
        });

    } catch (error) {
        // Log the actual backend error
        console.error("Error scheduling package:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to update package schedule"
        });
    }
};


export { createPackage, updatePackage, deletePackage, getAllPackages, changePackageStatus, schedulePackage };