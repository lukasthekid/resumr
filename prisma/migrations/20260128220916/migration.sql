-- DropIndex
DROP INDEX "documents_embedding_idx";

-- DropIndex
DROP INDEX "idx_documents_metadata";

-- AlterTable
ALTER TABLE "documents" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;
