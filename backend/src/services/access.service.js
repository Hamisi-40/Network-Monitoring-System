import prisma from "../config/database.js";
import { SubscriptionStatus } from "@prisma/client";

export const checkInternetAccess = async (deviceMac) => {
    const customer = await prisma.customer.findUnique({
        where: {
            deviceMac
        }
    });

    if (!customer) {
        return {
            hasAccess: false,
            reason: "CUSTOMER_NOT_FOUND"
        };
    }

    const now = new Date();

    const subscription = await prisma.subscription.findFirst({
        where: {
            customerId: customer.id,
            status: SubscriptionStatus.ACTIVE,
            startTime: {
                lte: now
            },
            endTime: {
                gt: now
            }
        },
        include: {
            package: true
        },
        orderBy: {
            endTime: "desc"
        }
    });

    if (!subscription) {
        return {
            hasAccess: false,
            reason: "NO_ACTIVE_SUBSCRIPTION"
        };
    }

    return {
        hasAccess: true,
        reason: "ACTIVE_SUBSCRIPTION",
        subscription: {
            id: subscription.id,
            packageName: subscription.package.name,
            startTime: subscription.startTime,
            endTime: subscription.endTime,
            status: subscription.status
        }
    };
};