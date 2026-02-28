"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const VALID_STAGES = [
  "applied",
  "interviewing",
  "final_round",
  "offer",
  "rejected",
] as const;

export async function updateApplicationStage(
  applicationId: number,
  stage: string
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = (session.user as { id?: string }).id;
  if (!userId) throw new Error("Unauthorized");

  if (!VALID_STAGES.includes(stage as (typeof VALID_STAGES)[number])) {
    throw new Error("Invalid stage");
  }

  await (prisma as any).jobApplication.update({
    where: { id: applicationId, userId },
    data: { stage },
  });
}
