import { loginAdmin } from "../services/auth.service.js";

export const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required"
            });
        }

        const result = await loginAdmin(username, password);

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: result
        });
    } catch (error) {
        console.error("Admin login error:", error);

        res.status(401).json({
            success: false,
            message: "Invalid username or password"
        });
    }
};