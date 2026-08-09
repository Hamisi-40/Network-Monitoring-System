import { createDemoPayment, confirmDemoPayment, getAllPayments } from "../services/payment.service.js";

export const createPayment = async (req, res) => {
    try {
        const {
            phoneNumber, deviceMac, packageId, provider
        } = req.body;

        if ( !phoneNumber || !deviceMac || !packageId || !provider ) {
            return res.status(400).json({
                success: false,
                message:
                    "phoneNumber, deviceMac, packageId and provider are required"
            });
        }

        const payment = await createDemoPayment({
            phoneNumber, deviceMac, packageId, provider
        });

        res.status(201).json({
            success: true,
            message: "Payment initiated successfully",
            data: payment
        });
    } catch (error) {
        console.error("Create payment error:", error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const confirmPayment = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await confirmDemoPayment(id);

        res.status(200).json({
            success: true,
            message: "Payment confirmed successfully",
            data: result
        });
    } catch (error) {
        console.error("Confirm payment error:", error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getPayments = async (req, res) => {
    try {
        const payments = await getAllPayments();

        res.status(200).json({
            success: true,
            data: payments
        });

    } catch (error) {
        console.error("Error fetching payments:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch payments"
        });
    }
};