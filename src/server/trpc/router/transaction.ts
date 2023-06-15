import { TRPCError } from "@trpc/server";
import { type z } from "zod";
import {
  transaction,
  transactionRefine,
  transactionRefineMessage,
  transactionWithId,
  withId,
} from "../../../types/zod";
import { protectedProcedure, router } from "../trpc";
import { TransactionType, transactions } from "../../db/schema/transactions";
import {
  guaps,
  transactionsExternalGuap,
  transactionsGuap,
  transactionsInternalGuap,
} from "../../db/schema/guaps";
import { and, desc, eq, or } from "drizzle-orm";
import { type PostgresJsDatabase } from "drizzle-orm/postgres-js";

export const transactionRouter = router({
  getAllTransactions: protectedProcedure.query(({ ctx }) => {
    return ctx.db
      .select()
      .from(transactions)
      .innerJoin(guaps, eq(transactions.guapId, guaps.id))
      .where(eq(guaps.userId, ctx.session.user.id));
  }),
  getTransactionsByGuap: protectedProcedure
    .input(withId)
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(transactions)
        .where(
          or(
            and(
              eq(transactions.guapId, input.id),
              eq(guaps.userId, ctx.session.user.id)
            ),
            and(
              eq(transactionsInternalGuap.id, input.id),
              eq(transactionsInternalGuap.userId, ctx.session.user.id)
            )
          )
        )
        .innerJoin(guaps, eq(guaps.id, transactions.guapId))
        .leftJoin(
          transactionsInternalGuap,
          eq(transactionsInternalGuap.id, transactions.internalGuapId)
        )
        .leftJoin(
          transactionsExternalGuap,
          eq(transactionsExternalGuap.id, transactions.externalGuapId)
        )
        .orderBy(desc(transactions.date));
    }),
  createTransaction: protectedProcedure
    .input(transaction.refine(transactionRefine, transactionRefineMessage))
    .mutation(async ({ ctx, input }) => {
      preValidate(input);

      delete input.sendToGuap;

      await ctx.db.transaction(async (tx) => {
        try {
          await doTransaction(tx, ctx.session.user.id, input);

          await tx.insert(transactions).values({
            ...input,
            date: input.date ? new Date(input.date) : new Date(),
          });
        } catch (e) {
          tx.rollback();
          console.log(e);
        }
      });
    }),
  editTransaction: protectedProcedure
    .input(
      transactionWithId.refine(transactionRefine, transactionRefineMessage)
    )
    .mutation(async ({ ctx, input }) => {
      preValidate(input);

      delete input.sendToGuap;

      await ctx.db.transaction(async (tx) => {
        try {
          // reset balances then edit transaction
          await resetBalances(tx, ctx.session.user.id, input);
          await doTransaction(tx, ctx.session.user.id, input);

          await tx
            .update(transactions)
            .set({ ...input, date: new Date(input.date) ?? new Date() })
            .where(
              and(
                eq(transactions.id, input.id),
                eq(transactionsGuap.userId, ctx.session.user.id)
              )
            );
        } catch (e) {
          tx.rollback();
          console.log(e);
        }
      });
    }),
  deleteTransaction: protectedProcedure
    .input(
      transactionWithId.refine(transactionRefine, transactionRefineMessage)
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (tx) => {
        try {
          // reset balances then delete transaction
          await resetBalances(tx, ctx.session.user.id, input);

          await tx.delete(transactions).where(eq(transactions.id, input.id));
        } catch (e) {
          tx.rollback();
          console.log(e);
        }
      });
    }),
});

const preValidate = (input: z.infer<typeof transaction>) => {
  if (input.internalGuapId && input.externalGuapId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Only provide either Guap or Peer/Biller",
    });
  }

  if (!input.internalGuapId && !input.externalGuapId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Either Guap or Peer/Biller required",
    });
  }
};

const resetBalances = async (
  db: PostgresJsDatabase,
  userId: string,
  input: z.infer<typeof transactionWithId>
) => {
  const transaction = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, input.id))
    .then((res) => res[0]);
  if (!transaction) {
    throw new TRPCError({
      message: "Transaction not found",
      code: "NOT_FOUND",
    });
  }

  const guap = await db
    .select()
    .from(guaps)
    .where(and(eq(guaps.id, input.guapId), eq(guaps.userId, userId)))
    .then((res) => res[0]);
  if (!guap) {
    throw new TRPCError({ message: "Guap not found", code: "NOT_FOUND" });
  }

  let newBalance;

  if (input.type === TransactionType.INCOMING) {
    newBalance = guap.balance - transaction.amount;
  } else if (input.type === TransactionType.OUTGOING) {
    newBalance = guap.balance + transaction.amount;

    if (input.internalGuapId) {
      const ownGuap = await db
        .select()
        .from(guaps)
        .where(eq(guaps.id, input.internalGuapId))
        .then((res) => res[0]);

      if (!ownGuap) {
        throw new TRPCError({ message: "Guap not found", code: "NOT_FOUND" });
      }

      const ownGuapNewBalance = ownGuap.balance - transaction.amount;

      await db
        .update(guaps)
        .set({ balance: ownGuapNewBalance })
        .where(eq(guaps.id, ownGuap.id));
    }
  }

  await db
    .update(guaps)
    .set({ balance: newBalance })
    .where(eq(guaps.id, input.guapId));
};

const doTransaction = async (
  db: PostgresJsDatabase,
  userId: string,
  input: z.infer<typeof transaction>
) => {
  const guap = await db
    .select()
    .from(guaps)
    .where(and(eq(guaps.id, input.guapId), eq(guaps.userId, userId)))
    .then((res) => res[0]);

  if (!guap) {
    throw new TRPCError({ message: "Guap not found", code: "NOT_FOUND" });
  }

  if (input.amount > guap.balance && input.type === TransactionType.OUTGOING) {
    throw new TRPCError({ message: "Not enough balance", code: "BAD_REQUEST" });
  }

  let newBalance;

  if (input.type === TransactionType.INCOMING) {
    newBalance = guap.balance + input.amount;
  } else if (input.type === TransactionType.OUTGOING) {
    newBalance = guap.balance - input.amount;

    if (input.internalGuapId) {
      const ownGuap = await db
        .select()
        .from(guaps)
        .where(eq(guaps.id, input.internalGuapId))
        .then((res) => res[0]);

      if (!ownGuap) {
        throw new TRPCError({ message: "Guap not found", code: "NOT_FOUND" });
      }

      const ownGuapNewBalance = ownGuap.balance + input.amount;

      await db
        .update(guaps)
        .set({ balance: ownGuapNewBalance })
        .where(eq(guaps.id, ownGuap.id));
    }
  }

  await db
    .update(guaps)
    .set({ balance: newBalance })
    .where(eq(guaps.id, input.guapId));
};

