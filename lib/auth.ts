import { NextAuthOptions } from "next-auth";
import prisma from "./prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { loginRateLimiter } from "./auth/rate-limiter";
import { securityLogger } from "./auth/security-logger";
import { AccountLockout } from "./auth/account-lockout";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is not defined in environment variables");
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
      },
    },
  },
  providers: [
    CredentialsProvider({
      type: "credentials",
      name: "Credentials",
      id: "credentials",
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "Username",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("No credentials provided");
        }

        // Rate limiting by username
        const rateLimit = loginRateLimiter.check(credentials.username);
        if (!rateLimit.allowed) {
          securityLogger.logRateLimited(credentials.username);
          const minutesRemaining = Math.ceil((rateLimit.resetTime - Date.now()) / 60000);
          throw new Error(`Too many login attempts. Try again in ${minutesRemaining} minutes.`);
        }

        const user = await prisma.user.findUnique({
          where: {
            username: credentials.username,
          },
          select: {
            id: true,
            username: true,
            password: true,
            createdAt: true,
          },
        });

        if (!user) {
          securityLogger.logLoginFailed(credentials.username, "User not found");
          throw new Error("Invalid username or password");
        }

        // Check if account is locked
        const isLocked = await AccountLockout.isLocked(user.id);
        if (isLocked) {
          const remainingMinutes = await AccountLockout.getRemainingLockoutTime(user.id);
          securityLogger.logAccountLocked(credentials.username);
          throw new Error(`Account is locked. Try again in ${remainingMinutes} minutes.`);
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          // Record failed attempt
          const nowLocked = await AccountLockout.recordFailedAttempt(user.id);

          if (nowLocked) {
            securityLogger.logAccountLocked(credentials.username);
            throw new Error(
              `Account locked due to multiple failed login attempts. Try again in 15 minutes.`
            );
          }

          securityLogger.logLoginFailed(credentials.username, "Invalid password");
          throw new Error("Invalid username or password");
        }

        // Successful login: reset failed attempts and rate limit
        await AccountLockout.resetFailedAttempts(user.id);
        loginRateLimiter.reset(credentials.username);
        securityLogger.logLoginSuccess(user.username, user.id);

        return {
          id: user.id,
          username: user.username,
          createdAt: user.createdAt.toISOString(),
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.createdAt = user.createdAt;
      }
      return token;
    },

    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.createdAt = token.createdAt;
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
