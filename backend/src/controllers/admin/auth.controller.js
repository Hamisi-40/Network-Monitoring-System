// Import bcrypt to compare the submitted password with the hashed password
import bcrypt from "bcrypt";

// Import jsonwebtoken to create the admin authentication token
import jwt from "jsonwebtoken";

// Import PostgreSQL connection pool
import { pool } from "../../database/database.js";


// Admin login controller
const loginAdmin = async (req, res) => {
    try {
        // Get login credentials sent from Postman/admin app
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find the admin account by email
        const result = await pool.query(
            `
            SELECT
                id,
                name,
                email,
                password,
                is_active
            FROM admins
            WHERE email = $1
            LIMIT 1
            `,
            [email]
        );

        // Stop if the admin account does not exist
        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const admin = result.rows[0];

        // Prevent disabled admin accounts from logging in
        if (!admin.is_active) {
            return res.status(403).json({
                success: false,
                message: "Admin account is disabled"
            });
        }

        // Compare plain password with the bcrypt hash stored in PostgreSQL
        const passwordMatches = await bcrypt.compare(
            password,
            admin.password
        );

        // Stop if password is incorrect
        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Create the JWT token
        const token = jwt.sign(
            {
                adminId: admin.id,
                email: admin.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d"
            }
        );

        // Return the token and safe admin information
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email
            }
        });

    } catch (error) {
        // Log the real server error
        console.error("Admin login error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to login"
        });
    }
};

// Return the currently authenticated admin
const getCurrentAdmin = async (req, res) => {
    try {
        // adminAuth middleware already decoded the JWT
        // and stored the token data inside req.admin
        const adminId = req.admin.adminId;

        // Fetch the latest admin information from PostgreSQL
        const result = await pool.query(
            `
            SELECT
                id,
                name,
                email,
                is_active,
                created_at
            FROM admins
            WHERE id = $1
            LIMIT 1
            `,
            [adminId]
        );

        // Stop if the admin account no longer exists
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Admin account not found"
            });
        }

        const admin = result.rows[0];

        // Prevent disabled accounts from continuing to use the system
        if (!admin.is_active) {
            return res.status(403).json({
                success: false,
                message: "Admin account is disabled"
            });
        }

        // Return safe admin information only
        res.status(200).json({
            success: true,
            admin
        });

    } catch (error) {
        // Log the actual backend error
        console.error("Get current admin error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch admin profile"
        });
    }
};


export { loginAdmin, getCurrentAdmin };