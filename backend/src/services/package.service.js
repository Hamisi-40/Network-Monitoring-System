import prisma from "../config/database.js";

export const getAllPackages = async () => {
    return await prisma.package.findMany({
        where: {
            isActive: true
        },
        orderBy: {
            price: "asc"
        }
    });
};

export const createNewPackage = async ({
    name, price, duration, durationUnit
}) => {
    return await prisma.package.create({
        data: {
            name, price, duration, durationUnit, isActive: true
        }
    });
}; 

export const updateExistingPackage = async (
    id, { name, price, duration, durationUnit }
) => {
    return await prisma.package.update({
        where: {
            id: Number(id)
        },
        data: {
            name, price, duration, durationUnit
        }
    });
};

export const deactivateExistingPackage = async (id) => {
    return await prisma.package.update({
        where: {
            id: Number(id)
        },
        data: {
            isActive: false
        }
    });
};