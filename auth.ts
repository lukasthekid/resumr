import { headers } from "next/headers";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "@/lib/prisma";

export const authInstance = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET ?? process.env.AUTH_SECRET,
  trustedOrigins: [
    process.env.BETTER_AUTH_URL ?? process.env.AUTH_URL ?? "http://localhost:3000",
  ],
  database: prismaAdapter(prisma as any, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      prompt: "select_account",
    },
    github: {
      clientId: process.env.GIT_HUB_CLIENT_ID as string,
      clientSecret: process.env.GIT_HUB_CLIENT_SECRET as string,
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID as string,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
    },
  },
});

/**
 * Compatibility helper for existing server code that previously called `auth()`
 * from Auth.js. Returns the Better Auth session from request headers.
 */
export async function auth() {
  return authInstance.api.getSession({
    headers: await headers(),
  });
}

