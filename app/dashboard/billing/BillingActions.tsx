"use client";

import { useState } from "react";
import { CreditCard, ExternalLink } from "lucide-react";

type BillingActionsProps = {
  isPro: boolean;
  hasStripeCustomer: boolean;
};

export function BillingActions({ isPro, hasStripeCustomer }: BillingActionsProps) {
  const [loading, setLoading] = useState<"checkout" | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setError(null);
    setLoading("checkout");
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const data = (await res.json().catch(() => null)) as { url?: string; error?: string };
      if (!res.ok) {
        setError(data?.error ?? "Checkout failed.");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("No checkout URL returned.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed.");
    } finally {
      setLoading(null);
    }
  }

  async function openPortal() {
    setError(null);
    setLoading("portal");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = (await res.json().catch(() => null)) as { url?: string; error?: string };
      if (!res.ok) {
        setError(data?.error ?? "Could not open billing portal.");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("No portal URL returned.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Portal failed.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      {isPro && hasStripeCustomer ? (
        <button
          type="button"
          onClick={openPortal}
          disabled={loading !== null}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover transition-colors disabled:opacity-60"
        >
          <CreditCard className="h-4 w-4" />
          {loading === "portal" ? "Opening…" : "Manage subscription"}
          <ExternalLink className="h-3.5 w-3.5 opacity-80" />
        </button>
      ) : (
        <button
          type="button"
          onClick={startCheckout}
          disabled={loading !== null}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover transition-colors disabled:opacity-60"
        >
          <CreditCard className="h-4 w-4" />
          {loading === "checkout" ? "Redirecting…" : "Upgrade to Pro"}
        </button>
      )}

      {error && (
        <p className="text-sm text-rose-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
