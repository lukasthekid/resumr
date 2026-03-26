-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('free', 'pro');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "User" ADD COLUMN "stripeSubscriptionId" TEXT;
ALTER TABLE "User" ADD COLUMN "stripeSubscriptionStatus" TEXT;
ALTER TABLE "User" ADD COLUMN "plan" "PlanTier" NOT NULL DEFAULT 'free';
ALTER TABLE "User" ADD COLUMN "resumeGenerationsUsed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "coverLetterGenerationsUsed" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");
