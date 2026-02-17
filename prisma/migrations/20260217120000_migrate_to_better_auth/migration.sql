-- Better Auth migration from Auth.js schema

-- 1) User table: normalize required fields and convert emailVerified DateTime -> Boolean
UPDATE "User"
SET "email" = COALESCE("email", 'user_' || "id" || '@example.local');

UPDATE "User"
SET "name" = COALESCE(NULLIF(BTRIM("name"), ''), SPLIT_PART("email", '@', 1), 'User');

ALTER TABLE "User"
ADD COLUMN "emailVerified_new" BOOLEAN NOT NULL DEFAULT false;

UPDATE "User"
SET "emailVerified_new" = CASE
  WHEN "emailVerified" IS NULL THEN false
  ELSE true
END;

ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "User" DROP COLUMN "emailVerified";
ALTER TABLE "User" RENAME COLUMN "emailVerified_new" TO "emailVerified";

-- 2) Account table: rename Auth.js fields to Better Auth fields
ALTER TABLE "Account" RENAME COLUMN "providerAccountId" TO "accountId";
ALTER TABLE "Account" RENAME COLUMN "provider" TO "providerId";
ALTER TABLE "Account" RENAME COLUMN "refresh_token" TO "refreshToken";
ALTER TABLE "Account" RENAME COLUMN "access_token" TO "accessToken";
ALTER TABLE "Account" RENAME COLUMN "id_token" TO "idToken";

ALTER TABLE "Account"
ADD COLUMN "accessTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN "refreshTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN "password" TEXT,
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "Account"
SET "accessTokenExpiresAt" = CASE
  WHEN "expires_at" IS NULL THEN NULL
  ELSE TO_TIMESTAMP("expires_at")::timestamp
END;

ALTER TABLE "Account" DROP COLUMN "expires_at";
ALTER TABLE "Account" DROP COLUMN "type";
ALTER TABLE "Account" DROP COLUMN "token_type";
ALTER TABLE "Account" DROP COLUMN "session_state";

DROP INDEX IF EXISTS "Account_provider_providerAccountId_key";
CREATE UNIQUE INDEX "Account_providerId_accountId_key"
ON "Account"("providerId", "accountId");

-- 3) Session table: rename and extend fields
ALTER TABLE "Session" RENAME COLUMN "sessionToken" TO "token";
ALTER TABLE "Session" RENAME COLUMN "expires" TO "expiresAt";

ALTER TABLE "Session"
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "ipAddress" TEXT,
ADD COLUMN "userAgent" TEXT;

DROP INDEX IF EXISTS "Session_sessionToken_key";
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- 4) Verification table: replace VerificationToken with Better Auth Verification
DROP TABLE IF EXISTS "VerificationToken";

CREATE TABLE "Verification" (
  "id" TEXT NOT NULL,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3),
  CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);
