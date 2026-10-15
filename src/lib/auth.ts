import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, accounts, sessions, verificationTokens } from "@/db/schema";
import type { AppRole } from "@/lib/guards";

type AuthUser = { role?: AppRole; organizationId?: string | null };

function resolveAuthUrl(): string | undefined {
  if (process.env.AUTH_URL) return process.env.AUTH_URL;
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

const resolvedAuthUrl = resolveAuthUrl();
if (resolvedAuthUrl) {
  process.env.AUTH_URL = resolvedAuthUrl;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "jwt" },
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as typeof user & AuthUser;
        token.id = u.id as string;
        token.role = (u.role ?? "visiteur") as AppRole;
        token.organizationId = u.organizationId ?? null;
      } else if (token.id && !token.role) {
        const [dbUser] = await db
          .select({
            role: users.role,
            organizationId: users.organizationId,
          })
          .from(users)
          .where(eq(users.id, token.id))
          .limit(1);
        if (dbUser) {
          token.role = dbUser.role as AppRole;
          token.organizationId = dbUser.organizationId ?? null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role ?? "visiteur";
        session.user.organizationId = token.organizationId ?? null;
      }
      return session;
    },
  },
});
