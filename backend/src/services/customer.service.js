import prisma from "../config/database.js";

export const findOrCreateCustomer = async ({
    phoneNumber, deviceMac
}) => {
    const existingCustomer = await prisma.customer.findUnique({
        where: {
            deviceMac
        }
    });

    if (existingCustomer) {
        if (existingCustomer.phoneNumber !== phoneNumber) {
            return await prisma.customer.update({
                where: {
                    id: existingCustomer.id
                },
                data: {
                    phoneNumber
                }
            });
        }

        return existingCustomer;
    }

    return await prisma.customer.create({
        data: {
            phoneNumber,
            deviceMac
        }
    });
};

export const getAllCustomers = async () => {
    return await prisma.customer.findMany({
        orderBy: {
            createdAt: "desc"
        },
        include: {
            subscriptions: {
                include: {
                    package: true
                },
                orderBy: {
                    startTime: "desc"
                }
            }
        }
    });
};