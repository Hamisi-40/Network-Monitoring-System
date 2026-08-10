// Import jsonwebtoken so we can verify JWT tokens
import jwt from "jsonwebtoken";

// Middleware that protects administrator-only routes
const adminAuth = (req, res, next) => {
    try {
        // Read the Authorization header
        // Expected format:
        // Authorization: Bearer YOUR_TOKEN
        const authHeader = req.headers.authorization;

        // Stop if no token was provided
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Remove "Bearer " and keep only the token
        const token = authHeader.split(" ")[1];

        // Verify the token using the same JWT secret
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Store decoded admin information on the request
        // Other controllers can now access req.admin
        req.admin = decoded;

        // Allow the request to continue
        next();

    } catch (error) {
        // Token may be invalid, expired, or incorrectly signed
        console.error("Admin authentication error:", error.message);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token"
        });
    }
};

export { adminAuth };