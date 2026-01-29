-- Make JobListing shared across users (global by URL).
-- Drops user relation and enforces uniqueness on url.

-- Drop foreign key first (if it exists)
ALTER TABLE "JobListing" DROP CONSTRAINT IF EXISTS "JobListing_userId_fkey";

-- Drop old composite unique index (if it exists)
DROP INDEX IF EXISTS "JobListing_userId_url_key";

-- Drop userId column (if it exists)
ALTER TABLE "JobListing" DROP COLUMN IF EXISTS "userId";

-- Ensure url is unique globally
CREATE UNIQUE INDEX IF NOT EXISTS "JobListing_url_key" ON "JobListing"("url");

-- Keep a non-unique index on url too (harmless if present; unique already indexes it)
CREATE INDEX IF NOT EXISTS "JobListing_url_idx" ON "JobListing"("url");

