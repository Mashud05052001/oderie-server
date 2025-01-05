/*
  Warnings:

  - A unique constraint covering the columns `[reviewId]` on the table `vendorResponses` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "vendorResponses_reviewId_key" ON "vendorResponses"("reviewId");
