-- Drop the index on the old column
DROP INDEX IF EXISTS "JobApplication_status_idx";

-- Drop the old column (removes dependency on old enum)
ALTER TABLE "JobApplication" DROP COLUMN IF EXISTS "status";

-- Drop the old enum type
DROP TYPE IF EXISTS "ApplicationStatus";

-- Create the new enum type
CREATE TYPE "ApplicationStage" AS ENUM ('applied', 'interviewing', 'final_round', 'offer', 'rejected');

-- Add the new column with the new enum type
ALTER TABLE "JobApplication" ADD COLUMN "stage" "ApplicationStage" NOT NULL DEFAULT 'applied';

-- Create index on the new column
CREATE INDEX "JobApplication_stage_idx" ON "JobApplication"("stage");
