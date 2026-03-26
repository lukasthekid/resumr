/**
 * Public base URL for redirects (Stripe Checkout, Customer Portal).
 */
export function getAppBaseUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.BETTER_AUTH_URL ??
    process.env.AUTH_URL;
  if (fromEnv && fromEnv.startsWith("http")) {
    return fromEnv.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}
