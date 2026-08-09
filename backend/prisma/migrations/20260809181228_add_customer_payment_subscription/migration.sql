/*
  Warnings:

  - You are about to drop the column `expiryTime` on the `Subscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[deviceMac]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deviceMac` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "deviceMac" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "expiryTime",
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_deviceMac_key" ON "Customer"("deviceMac");
