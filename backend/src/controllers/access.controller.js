import { checkInternetAccess } from "../services/access.service.js";

export const checkAccess = async (req, res) => {
    try {
        const { deviceMac } = req.query;

        if (!deviceMac) {
            return res.status(400).json({
                success: false,
                message: "deviceMac is required"
            });
        }

        const result = await checkInternetAccess(deviceMac);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("Access check error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to check internet access"
        });
    }
};