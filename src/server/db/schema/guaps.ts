import { type InferModel, relations } from "drizzle-orm";
import {
  alias,
  pgTable,
  text,
  uuid,
  timestamp,
  pgEnum,
  real,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { transactions } from "./transactions";

export const guaps = pgTable("guaps", {
  id: uuid("id").notNull().defaultRandom().primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  balance: real("balance").notNull(),
  image: text("image"),
});

export const transactionsGuap = alias(guaps, "guap");
export const transactionsInternalGuap = alias(guaps, "internalGuap");

export const guapsRelations = relations(guaps, ({ one, many }) => ({
  user: one(users, {
    fields: [guaps.userId],
    references: [users.id],
  }),
  transactions: many(transactions, { relationName: "guap" }),
  internalTransactions: many(transactions, { relationName: "internalGuap" }),
}));

export type Guap = InferModel<typeof guaps>;
export type NewGuap = InferModel<typeof guaps, "insert">;

export const externalGuapTypeEnum = pgEnum("external_guap_type", [
  "BILLER",
  "PEER",
]);

export enum ExternalGuapType {
  BILLER = "BILLER",
  PEER = "PEER",
}

export const externalGuaps = pgTable("external_guaps", {
  id: uuid("id").notNull().defaultRandom().primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  type: externalGuapTypeEnum("type").notNull(),
});

export const externalGuapsRelations = relations(
  externalGuaps,
  ({ one, many }) => ({
    user: one(users, {
      fields: [externalGuaps.userId],
      references: [users.id],
    }),
    transactions: many(transactions),
  })
);

export type ExternalGuap = InferModel<typeof externalGuaps>;
export type NewExternalGuap = InferModel<typeof externalGuaps, "insert">;

export const transactionsExternalGuap = alias(externalGuaps, "externalGuap");
