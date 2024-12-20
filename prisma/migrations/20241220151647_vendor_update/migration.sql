/*
  Warnings:

  - You are about to drop the column `addresss` on the `vendors` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "vendors" DROP COLUMN "addresss",
ADD COLUMN     "address" TEXT;
