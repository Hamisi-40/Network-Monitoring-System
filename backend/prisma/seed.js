import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

// 1. Create a native connection pool
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// 2. Pass it to the Prisma Adapter
const adapter = new PrismaPg(pool);

// 3. Initialize Prisma Client with the adapter
const prisma = new PrismaClient({ adapter });

async function main() { 
  // Seed data for the Package model 
  await prisma.package.createMany({ 
    data: [ 
      { name: "1 Hour", price: 500, duration: 1, durationUnit: "HOURS", isActive: true }, 
      { name: "3 Hours", price: 1000, duration: 3, durationUnit: "HOURS", isActive: true }, 
      { name: "24 Hours", price: 2000, duration: 24, durationUnit: "HOURS", isActive: true } 
    ] 
  }); 
  
  console.log("Packages created successfully."); 
} 

main() 
  .catch((error) => { 
    console.error(error); 
    process.exit(1); 
  }) 
  .finally(async () => { 
    await prisma.$disconnect(); // Fixed typo here
  });
