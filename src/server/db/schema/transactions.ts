import { type InferModel, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  uuid,
  timestamp,
  pgEnum,
  real,
} from "drizzle-orm/pg-core";
import { guaps, externalGuaps } from "./guaps";
import { attachments } from "./attachments";

// TODO: rename to DEBIT/CREDIT or DEPOSIT/EXPENSE
export const transactionTypeEnum = pgEnum("transaction_type", [
  "INCOMING",
  "OUTGOING",
]);

export enum TransactionType {
  INCOMING = "INCOMING",
  OUTGOING = "OUTGOING",
}

export const transactions = pgTable("transactions", {
  id: uuid("id").notNull().defaultRandom().primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  date: timestamp("date", { mode: "string" }).defaultNow().notNull(),
  amount: real("amount").notNull(),
  description: text("description"),
  guapId: uuid("guap_id")
    .notNull()
    .references(() => guaps.id, { onDelete: "cascade" }),
  internalGuapId: uuid("internal_guap_id").references(() => guaps.id, {
    onDelete: "cascade",
  }),
  externalGuapId: uuid("external_guap_id").references(() => externalGuaps.id, {
    onDelete: "cascade",
  }),
  image: text("image"),
  type: transactionTypeEnum("type").notNull(),
});

export const transactionsRelations = relations(
  transactions,
  ({ one, many }) => ({
    guap: one(guaps, {
      fields: [transactions.guapId],
      references: [guaps.id],
    }),
    internalGuap: one(guaps, {
      fields: [transactions.internalGuapId],
      references: [guaps.id],
    }),
    externalGuap: one(externalGuaps, {
      fields: [transactions.externalGuapId],
      references: [externalGuaps.id],
    }),
    attachments: many(attachments),
  })
);

export type Transaction = InferModel<typeof transactions>;
export type NewTransaction = InferModel<typeof transactions, "insert">;
