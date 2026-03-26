import { auth } from "@/auth";
import {
  hasProAccess,
} from "@/lib/billing/limits";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BillingActions } from "./BillingActions";

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  const userId = (session.user as { id?: string }).id;
  if (!userId || typeof userId !== "string") redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      stripeSubscriptionStatus: true,
      stripeCustomerId: true,
    },
  });

  const pro = user
    ? hasProAccess(user.plan, user.stripeSubscriptionStatus)
    : false;

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing</h1>
        <p className="text-sm text-foreground-muted mt-1">
          Manage your Resumr subscription and payment method.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-medium text-foreground-muted">Current plan</p>
            <p className="text-lg font-semibold text-foreground">
              {pro ? "Pro" : "Starter (free)"}
            </p>
            {pro && user?.stripeSubscriptionStatus && (
              <p className="text-xs text-foreground-muted mt-1 capitalize">
                Status: {user.stripeSubscriptionStatus.replace(/_/g, " ")}
              </p>
            )}
          </div>
        </div>

        <BillingActions
          isPro={pro}
          hasStripeCustomer={!!user?.stripeCustomerId}
        />

        <p className="text-xs text-foreground-subtle pt-2 border-t border-border">
          Pro includes unlimited AI resume and cover letter generations and unlimited resume
          uploads. Starter includes limited generations and one resume file in context at a time.
        </p>
      </div>
    </div>
  );
}
