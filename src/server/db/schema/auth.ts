import { type InferModel, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { externalGuaps, guaps } from "./guaps";

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").notNull().defaultRandom().primaryKey(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"),
    tokenType: text("token_type"),
    scope: text("scope"),
    idToken: text("id_token"),
    sessionState: text("session_state"),
  },
  (accounts) => ({
    providerProviderAccountIdUniqueIndex: uniqueIndex(
      "provider_provider_account_id_unique_idx"
    ).on(accounts.provider, accounts.providerAccountId),
  })
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export type Account = InferModel<typeof accounts>;
export type NewAccount = InferModel<typeof accounts, "insert">;

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").notNull().defaultRandom().primaryKey(),
    sessionToken: text("session_token").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires").notNull(),
  },
  (sessions) => ({
    sessionTokenUniqueIndex: uniqueIndex("session_token_unique_idx").on(
      sessions.sessionToken
    ),
  })
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export type Session = InferModel<typeof sessions>;
export type NewSession = InferModel<typeof sessions, "insert">;

export const users = pgTable(
  "users",
  {
    id: uuid("id").notNull().defaultRandom().primaryKey(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: timestamp("email_verified"),
    image: text("image"),
  },
  (users) => ({
    emailUniqueIndex: uniqueIndex("email_unique_idx").on(users.email),
  })
);

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  guaps: many(guaps),
  externalGuaps: many(externalGuaps),
}));

export type User = InferModel<typeof users>;
export type NewUser = InferModel<typeof users, "insert">;

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires").notNull(),
  },
  (verificationTokens) => ({
    tokenUniqueIndex: uniqueIndex("token_unique_idx").on(
      verificationTokens.token
    ),
  })
);

export type VerificationToken = InferModel<typeof verificationTokens>;
export type NewVerificationToken = InferModel<
  typeof verificationTokens,
  "insert"
>;
