import { getDashboardStats } from "../services/dashboard.service.js";

export const getDashboard = async (req, res) => {
    try {
        const stats = await getDashboardStats();

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error("Dashboard error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics"
        });
    }
};