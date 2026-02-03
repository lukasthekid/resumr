import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/lib/prisma";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma as any),
  session: { 
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Handle Google OAuth
      if (account?.provider === "google") {
        const email = user?.email;
        if (!email) return false;

        try {
          const existingUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
          });

          if (!existingUser) {
            await prisma.user.create({
              data: {
                email,
                name: user.name ?? null,
                image: user.image ?? null,
                emailVerified: new Date(),
              },
            });
          }

          return true;
        } catch (error) {
          console.error("Error ensuring Google user exists:", error);
          return false;
        }
      }

      return false;
    },
    async session({ session, user }) {
      // With database sessions, `user` comes from the User table via the Session relation
      if (session.user && user) {
        session.user.id = user.id;
        session.user.name = user.name;
        session.user.email = user.email;
        session.user.image = user.image;
      }
      return session;
    },
  },
});

