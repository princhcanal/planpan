import NextAuth, { type NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

import { env } from "../../../env/server.mjs";
import { db } from "../../../server/db/index";
import { type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { type Adapter } from "next-auth/adapters";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "../../../server/db/schema/auth";
import { and, eq } from "drizzle-orm";

const DrizzleAdapter = (client: PostgresJsDatabase): Adapter => {
  return {
    createUser: async (data) => {
      return (
        client
          .insert(users)
          .values({ ...data, id: crypto.randomUUID() })
          .returning()
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          .then((res) => res[0]!)
      );
    },
    getUser: async (data) => {
      return client
        .select()
        .from(users)
        .where(eq(users.id, data))
        .then((res) => res[0] ?? null);
    },
    getUserByEmail: async (data) => {
      return client
        .select()
        .from(users)
        .where(eq(users.email, data))
        .then((res) => res[0] ?? null);
    },
    createSession: async (data) => {
      return (
        client
          .insert(sessions)
          .values(data)
          .returning()
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          .then((res) => res[0]!)
      );
    },
    getSessionAndUser: async (data) => {
      return client
        .select({
          session: sessions,
          user: users,
        })
        .from(sessions)
        .where(eq(sessions.sessionToken, data))
        .innerJoin(users, eq(users.id, sessions.userId))
        .then((res) => res[0] ?? null);
    },
    updateUser: async (data) => {
      if (!data.id) {
        throw new Error("No user id.");
      }

      return (
        client
          .update(users)
          .set(data)
          .where(eq(users.id, data.id))
          .returning()
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          .then((res) => res[0]!)
      );
    },
    updateSession: async (data) => {
      return client
        .update(sessions)
        .set(data)
        .where(eq(sessions.sessionToken, data.sessionToken))
        .returning()
        .then((res) => res[0]);
    },
    linkAccount: async (rawAccount) => {
      await client
        .insert(accounts)
        .values({
          userId: rawAccount.userId,
          type: rawAccount.type,
          provider: rawAccount.provider,
          providerAccountId: rawAccount.providerAccountId,
          accessToken: rawAccount.access_token,
          refreshToken: rawAccount.refresh_token,
          expiresAt: rawAccount.expires_at,
          tokenType: rawAccount.token_type,
          idToken: rawAccount.id_token,
          sessionState: rawAccount.session_state,
        })
        .returning()
        .then((res) => res[0]);

      // // Drizzle will return `null` for fields that are not defined.
      // // However, the return type is expecting `undefined`.
      // const account = {
      //   ...updatedAccount,
      //   access_token: updatedAccount?.accessToken ?? undefined,
      //   token_type: updatedAccount?.tokenType ?? undefined,
      //   id_token: updatedAccount?.idToken ?? undefined,
      //   refresh_token: updatedAccount?.refreshToken ?? undefined,
      //   scope: updatedAccount?.scope ?? undefined,
      //   expires_at: updatedAccount?.expiresAt ?? undefined,
      //   session_state: updatedAccount?.sessionState ?? undefined,
      // };
      //
      // return account;
    },
    getUserByAccount: async (account) => {
      const dbAccount = await client
        .select()
        .from(accounts)
        .where(
          and(
            eq(accounts.providerAccountId, account.providerAccountId),
            eq(accounts.provider, account.provider)
          )
        )
        .leftJoin(users, eq(accounts.userId, users.id))
        .then((res) => res[0]);

      return dbAccount?.users ?? null;
    },
    deleteSession: async (sessionToken) => {
      await client
        .delete(sessions)
        .where(eq(sessions.sessionToken, sessionToken));
    },
    createVerificationToken: async (token) => {
      return client
        .insert(verificationTokens)
        .values(token)
        .returning()
        .then((res) => res[0]);
    },
    useVerificationToken: async (token) => {
      try {
        return client
          .delete(verificationTokens)
          .where(
            and(
              eq(verificationTokens.identifier, token.identifier),
              eq(verificationTokens.token, token.token)
            )
          )
          .returning()
          .then((res) => res[0] ?? null);
      } catch (err) {
        throw new Error("No verification token found.");
      }
    },
    deleteUser: async (id) => {
      await client
        .delete(users)
        .where(eq(users.id, id))
        .returning()
        .then((res) => res[0]);
    },
    unlinkAccount: async (account) => {
      await client
        .delete(accounts)
        .where(
          and(
            eq(accounts.providerAccountId, account.providerAccountId),
            eq(accounts.provider, account.provider)
          )
        );

      return undefined;
    },
  };
};

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  adapter: DrizzleAdapter(db),
  // Configure one or more authentication providers
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
    // ...add more providers here
  ],
};

export default NextAuth(authOptions);
