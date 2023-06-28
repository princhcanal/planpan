import { type InferModel, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  uuid,
  timestamp,
  pgEnum,
  numeric,
} from "drizzle-orm/pg-core";
import { wallets } from "./wallets";
import { attachments } from "./attachments";

export const transactionTypeEnum = pgEnum("transaction_type", [
  "EXPENSE",
  "INCOME",
  "TRANSFER",
]);

export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  TRANSFER = "TRANSFER",
}

export const transactions = pgTable("transactions", {
  id: uuid("id").notNull().defaultRandom().primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  date: timestamp("date", { mode: "string" }).defaultNow().notNull(),
  amount: numeric("amount").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  walletId: uuid("wallet_id")
    .notNull()
    .references(() => wallets.id),
  internalWalletId: uuid("internal_wallet_id").references(() => wallets.id, {
    onDelete: "set null",
  }),
  image: text("image"),
  type: transactionTypeEnum("type").notNull(),
});

export const transactionsRelations = relations(
  transactions,
  ({ one, many }) => ({
    wallet: one(wallets, {
      fields: [transactions.walletId],
      references: [wallets.id],
    }),
    internalWallet: one(wallets, {
      fields: [transactions.internalWalletId],
      references: [wallets.id],
    }),
    attachments: many(attachments),
  })
);

export type Transaction = InferModel<typeof transactions>;
export type NewTransaction = InferModel<typeof transactions, "insert">;
