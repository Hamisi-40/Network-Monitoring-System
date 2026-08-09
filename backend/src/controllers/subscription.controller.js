import { getAllSubscriptions } from "../services/subscription.service.js";

export const getSubscriptions = async (req, res) => {
    try {
        const subscriptions = await getAllSubscriptions();

        res.status(200).json({
            success: true,
            data: subscriptions
        });

    } catch (error) {
        console.error("Error fetching subscriptions:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch subscriptions"
        });
    }
};