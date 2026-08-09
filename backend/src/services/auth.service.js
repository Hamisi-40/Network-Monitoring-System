import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/database.js";

export const loginAdmin = async (username, password) => {
    const admin = await prisma.admin.findUnique({
        where: {
            username
        }
    });

    if (!admin) {
        throw new Error("Invalid username or password");
    }

    const passwordMatches = await bcrypt.compare(
        password,
        admin.password
    );

    if (!passwordMatches) {
        throw new Error("Invalid username or password");
    }

    const token = jwt.sign(
        {
            adminId: admin.id,
            username: admin.username
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "8h"
        }
    );

    return {
        token,
        admin: {
            id: admin.id,
            username: admin.username
        }
    };
};