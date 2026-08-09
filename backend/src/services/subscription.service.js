import prisma from "../config/database.js";

export const getAllSubscriptions = async () => {
    return await prisma.subscription.findMany({
        orderBy: {
            startTime: "desc"
        },
        include: {
            customer: true,
            package: true,
            payment: true
        }
    });
};