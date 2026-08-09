import prisma from "../config/database.js";
import { PaymentStatus } from "@prisma/client";
import { findOrCreateCustomer } from "./customer.service.js";
import { authorizeDevice } from "./mikrotik.service.js";

export const createDemoPayment = async ({
    phoneNumber, deviceMac, packageId, provider
}) => {
    // 1. Find or create customer
    const customer = await findOrCreateCustomer({
        phoneNumber, deviceMac
    });

    // 2. Find package
    const packageData = await prisma.package.findUnique({
        where: {
            id: Number(packageId)
        }
    });

    if (!packageData) {
        throw new Error("Package not found");
    }

    // 3. Make sure package is active
    if (!packageData.isActive) {
        throw new Error("Package is not available");
    }

    // 4. Create payment
    const payment = await prisma.payment.create({
        data: {
            amount: packageData.price,
            provider,
            phoneNumber,
            status: "PENDING",
            customerId: customer.id,
            packageId: packageData.id
        }
    });

    return payment;
};

export const confirmDemoPayment = async (paymentId) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Find payment
        const payment = await tx.payment.findUnique({
            where: {
                id: Number(paymentId)
            },
            include: {
                package: true,
                customer: true
            }
        });

        if (!payment) {
            throw new Error("Payment not found");
        }

        // 2. Prevent duplicate confirmation
        if (payment.status === PaymentStatus.SUCCESSFUL) {
            throw new Error("Payment has already been confirmed");
        }

        if (payment.status === PaymentStatus.FAILED) {
            throw new Error("Payment has already failed");
        }

        // 3. Generate demo transaction reference
        const transactionReference =
            `DEMO-${Date.now()}-${payment.id}`;

        // 4. Mark payment as successful
        const successfulPayment = await tx.payment.update({
            where: {
                id: payment.id
            },
            data: {
                status: PaymentStatus.SUCCESSFUL,
                transactionReference
            }
        });

        // 5. Calculate subscription time
        const startTime = new Date();

        const endTime = new Date(startTime);

        if (payment.package.durationUnit === "HOURS") {
            endTime.setHours(
                endTime.getHours() + payment.package.duration
            );
        } else if (payment.package.durationUnit === "DAYS") {
            endTime.setDate(
                endTime.getDate() + payment.package.duration
            );
        }

        // 6. Create subscription
        const subscription = await tx.subscription.create({
            data: {
                startTime,
                endTime,
                status: "ACTIVE",
                customerId: payment.customerId,
                packageId: payment.packageId,
                paymentId: payment.id
            }
        });

        // 7. Authorize device on MikroTik
        const authorization = await authorizeDevice({
            deviceMac: payment.customer.deviceMac,
            endTime
        });

        return {
            payment: successfulPayment,
            subscription,
            authorization
        };
    });
};

export const getAllPayments = async () => {
    return await prisma.payment.findMany({
        orderBy: {
            createdAt: "desc"
        },
        include: {
            customer: true,
            package: true,
            subscription: true
        }
    });
};