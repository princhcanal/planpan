import { type InferModel, relations } from "drizzle-orm";
import {
  alias,
  pgTable,
  text,
  uuid,
  timestamp,
  numeric,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { transactions } from "./transactions";

export const walletTypeEnum = pgEnum("wallet_type", [
  "SAVINGS",
  "CREDIT",
  "CASH",
  "E-WALLET",
  "INVESTMENT",
]);

export const paymentNetworkEnum = pgEnum("payment_network", [
  "MASTERCARD",
  "VISA",
  "JCB",
  "AMEX",
]);

export enum WalletType {
  SAVINGS = "SAVINGS",
  CREDIT = "CREDIT",
  CASH = "CASH",
  E_WALLET = "E-WALLET",
  INVESTMENT = "INVESTMENT",
}

export enum PaymentNetwork {
  MASTERCARD = "MASTERCARD",
  VISA = "VISA",
  JCB = "JCB",
  AMEX = "AMEX",
}

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
  type: walletTypeEnum("type").notNull(),
  paymentNetwork: paymentNetworkEnum("payment_network"),
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
