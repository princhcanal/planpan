import { type InferModel, relations } from "drizzle-orm";
import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { transactions } from "./transactions";

export const attachments = pgTable("attachments", {
  id: uuid("id").notNull().defaultRandom().primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  name: text("name").notNull(),
  attachmentUrl: text("attachment_url"),
  transactionId: uuid("transaction_id")
    .notNull()
    .references(() => transactions.id, { onDelete: "cascade" }),
});

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  transaction: one(transactions, {
    fields: [attachments.transactionId],
    references: [transactions.id],
  }),
}));

export type Attachment = InferModel<typeof attachments>;
export type NewAttachment = InferModel<typeof attachments, "insert">;
