import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
    adapter
});

async function main() {
    const username = "admin";
    const password = "admin123";

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
        data: {
            username,
            password: hashedPassword
        }
    });
}

main()
    .catch((error) => {
        console.error("Error creating admin:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });