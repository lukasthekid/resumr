import { prisma } from "@/lib/prisma";
import type { PlanTier } from "@/generated/prisma/client";

export const FREE_RESUME_CAP = 3;
export const FREE_COVER_CAP = 3;

export const QUOTA_ERROR_CODE = "QUOTA_EXCEEDED" as const;

export function hasProAccess(plan: PlanTier, stripeSubscriptionStatus: string | null): boolean {
  if (plan !== "pro") return false;
  const s = stripeSubscriptionStatus ?? "";
  return s === "active" || s === "trialing";
}

type CountRow = { count: bigint };

/** Rows in `documents` for this user (chunks from uploads). */
export async function countDocumentRowsForUser(userId: string): Promise<number> {
  const rows = await prisma.$queryRaw<CountRow[]>`
    SELECT COUNT(*)::bigint AS count
    FROM documents
    WHERE metadata->>'user_id' = ${userId}
  `;
  return Number(rows[0]?.count ?? 0);
}

export type UploadCheckResult =
  | { ok: true }
  | { ok: false; code: typeof QUOTA_ERROR_CODE; message: string };

/**
 * Free tier: at most one upload batch at a time (any rows for user blocks new uploads).
 * Only one file per request on free tier.
 */
export function checkFreeTierUpload(
  plan: PlanTier,
  stripeSubscriptionStatus: string | null,
  documentRowCount: number,
  fileCount: number
): UploadCheckResult {
  if (hasProAccess(plan, stripeSubscriptionStatus)) {
    return { ok: true };
  }
  if (fileCount > 1) {
    return {
      ok: false,
      code: QUOTA_ERROR_CODE,
      message:
        "Free plan allows one resume file at a time. Remove extra files or upgrade to Pro.",
    };
  }
  if (documentRowCount > 0) {
    return {
      ok: false,
      code: QUOTA_ERROR_CODE,
      message:
        "Free plan allows one resume file in context. Delete your current file in settings to upload a new one, or upgrade to Pro.",
    };
  }
  return { ok: true };
}

type ConsumeResult =
  | { ok: true }
  | { ok: false; code: typeof QUOTA_ERROR_CODE; message: string };

export async function consumeResumeGeneration(
  userId: string,
  plan: PlanTier,
  stripeSubscriptionStatus: string | null
): Promise<ConsumeResult> {
  if (hasProAccess(plan, stripeSubscriptionStatus)) {
    return { ok: true };
  }
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    UPDATE "User"
    SET "resumeGenerationsUsed" = "resumeGenerationsUsed" + 1
    WHERE id = ${userId}
      AND plan = 'free'
      AND "resumeGenerationsUsed" < ${FREE_RESUME_CAP}
    RETURNING id
  `;
  if (rows.length === 0) {
    return {
      ok: false,
      code: QUOTA_ERROR_CODE,
      message: `Free plan includes ${FREE_RESUME_CAP} resume generations. Upgrade to Pro for unlimited.`,
    };
  }
  return { ok: true };
}

export async function consumeCoverLetterGeneration(
  userId: string,
  plan: PlanTier,
  stripeSubscriptionStatus: string | null
): Promise<ConsumeResult> {
  if (hasProAccess(plan, stripeSubscriptionStatus)) {
    return { ok: true };
  }
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    UPDATE "User"
    SET "coverLetterGenerationsUsed" = "coverLetterGenerationsUsed" + 1
    WHERE id = ${userId}
      AND plan = 'free'
      AND "coverLetterGenerationsUsed" < ${FREE_COVER_CAP}
    RETURNING id
  `;
  if (rows.length === 0) {
    return {
      ok: false,
      code: QUOTA_ERROR_CODE,
      message: `Free plan includes ${FREE_COVER_CAP} cover letter generations. Upgrade to Pro for unlimited.`,
    };
  }
  return { ok: true };
}

export function remainingResumeGenerations(
  plan: PlanTier,
  stripeSubscriptionStatus: string | null,
  used: number
): number | null {
  if (hasProAccess(plan, stripeSubscriptionStatus)) return null;
  return Math.max(0, FREE_RESUME_CAP - used);
}

export function remainingCoverLetterGenerations(
  plan: PlanTier,
  stripeSubscriptionStatus: string | null,
  used: number
): number | null {
  if (hasProAccess(plan, stripeSubscriptionStatus)) return null;
  return Math.max(0, FREE_COVER_CAP - used);
}
