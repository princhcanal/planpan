import { type InferModel, relations } from "drizzle-orm";
import {
  alias,
  pgTable,
  text,
  uuid,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { transactions } from "./transactions";

export const wallets = pgTable("wallets", {
  id: uuid("id").notNull().defaultRandom().primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  balance: numeric("balance").notNull(),
  image: text("image"),
});

export const transactionsWallet = alias(wallets, "wallets");
export const transactionsInternalWallet = alias(wallets, "internalWallet");

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  transactions: many(transactions, { relationName: "wallet" }),
  internalTransactions: many(transactions, { relationName: "internalWallet" }),
}));

export type Wallet = InferModel<typeof wallets>;
export type NewWallet = InferModel<typeof wallets, "insert">;
