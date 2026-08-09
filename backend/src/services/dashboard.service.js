import prisma from "../config/database.js";
import { PaymentStatus, SubscriptionStatus } from "@prisma/client";

export const getDashboardStats = async () => {
    const [
        totalCustomers,
        activePackages,
        activeSubscriptions,
        successfulPayments,
        revenue
    ] = await Promise.all([
        prisma.customer.count(),

        prisma.package.count({
            where: {
                isActive: true
            }
        }),

        prisma.subscription.count({
            where: {
                status: SubscriptionStatus.ACTIVE
            }
        }),

        prisma.payment.count({
            where: {
                status: PaymentStatus.SUCCESSFUL
            }
        }),

        prisma.payment.aggregate({
            _sum: {
                amount: true
            },
            where: {
                status: PaymentStatus.SUCCESSFUL
            }
        })
    ]);

    return {
        totalCustomers,
        activePackages,
        activeSubscriptions,
        successfulPayments,
        totalRevenue: revenue._sum.amount ?? 0
    };
};