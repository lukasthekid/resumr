-- DropIndex
DROP INDEX "documents_embedding_idx";

-- DropIndex
DROP INDEX "idx_documents_metadata";

-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Verification" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "documents" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
