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
  wallets,
  transactionsRecipient,
  transactionsWallet,
  transactionsInternalWallet,
} from "../../db/schema/wallets";
import { and, desc, eq, or } from "drizzle-orm";
import { type PostgresJsDatabase } from "drizzle-orm/postgres-js";

export const transactionRouter = router({
  getAllTransactions: protectedProcedure.query(({ ctx }) => {
    return ctx.db
      .select()
      .from(transactions)
      .innerJoin(wallets, eq(transactions.walletId, wallets.id))
      .where(eq(wallets.userId, ctx.session.user.id));
  }),
  getTransactionsByWallet: protectedProcedure
    .input(withId)
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select({
          id: transactions.id,
          date: transactions.date,
          amount: transactions.amount,
          description: transactions.description,
          type: transactions.type,
          wallet: {
            id: wallets.id,
            name: wallets.name,
          },
          internalWallet: {
            id: transactionsInternalWallet.id,
            name: transactionsInternalWallet.name,
          },
          recipient: {
            id: transactionsRecipient.id,
            name: transactionsRecipient.name,
          },
        })
        .from(transactions)
        .where(
          or(
            and(
              eq(transactions.walletId, input.id),
              eq(wallets.userId, ctx.session.user.id)
            ),
            and(
              eq(transactionsInternalWallet.id, input.id),
              eq(transactionsInternalWallet.userId, ctx.session.user.id)
            )
          )
        )
        .innerJoin(wallets, eq(wallets.id, transactions.walletId))
        .leftJoin(
          transactionsInternalWallet,
          eq(transactionsInternalWallet.id, transactions.internalWalletId)
        )
        .leftJoin(
          transactionsRecipient,
          eq(transactionsRecipient.id, transactions.recipientId)
        )
        .orderBy(desc(transactions.date));
    }),
  createTransaction: protectedProcedure
    .input(transaction.refine(transactionRefine, transactionRefineMessage))
    .mutation(async ({ ctx, input }) => {
      preValidate(input);

      delete input.sendToInternalWallet;

      await ctx.db.transaction(async (tx) => {
        try {
          await doTransaction(tx, ctx.session.user.id, input);

          await tx.insert(transactions).values({
            ...input,
            date: input.date ?? new Date().toISOString(),
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

      delete input.sendToInternalWallet;

      await ctx.db.transaction(async (tx) => {
        try {
          // reset balances then edit transaction
          await resetBalances(tx, ctx.session.user.id, input);
          await doTransaction(tx, ctx.session.user.id, input);

          await tx
            .update(transactions)
            .set({
              ...input,
              date: input.date ?? new Date().toLocaleDateString(),
            })
            .where(
              and(
                eq(transactions.id, input.id),
                eq(transactionsWallet.userId, ctx.session.user.id)
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
      const sleep = (ms: number) => {
        return new Promise((resolve) => setTimeout(resolve, ms));
      };

      await sleep(3000);

      await ctx.db.transaction(async (tx) => {
        try {
          // reset balances then delete transaction
          await resetBalances(tx, ctx.session.user.id, input);

          return tx
            .delete(transactions)
            .where(eq(transactions.id, input.id))
            .returning()
            .then((res) => res[0]);
        } catch (e) {
          tx.rollback();
          console.log(e);
        }
      });
    }),
});

const preValidate = (input: z.infer<typeof transaction>) => {
  if (input.internalWalletId && input.recipientId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Only provide either Wallet or Recipient",
    });
  }

  if (!input.internalWalletId && !input.recipientId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Either Wallet or Recipient required",
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

  const wallet = await db
    .select()
    .from(wallets)
    .where(and(eq(wallets.id, input.walletId), eq(wallets.userId, userId)))
    .then((res) => res[0]);
  if (!wallet) {
    throw new TRPCError({ message: "Wallet not found", code: "NOT_FOUND" });
  }

  let newBalance;

  if (input.type === TransactionType.CREDIT) {
    newBalance = wallet.balance - transaction.amount;
  } else if (input.type === TransactionType.DEBIT) {
    newBalance = wallet.balance + transaction.amount;

    if (input.internalWalletId) {
      const ownWallet = await db
        .select()
        .from(wallets)
        .where(eq(wallets.id, input.internalWalletId))
        .then((res) => res[0]);

      if (!ownWallet) {
        throw new TRPCError({ message: "Wallet not found", code: "NOT_FOUND" });
      }

      const ownWalletNewBalance = ownWallet.balance - transaction.amount;

      await db
        .update(wallets)
        .set({ balance: ownWalletNewBalance })
        .where(eq(wallets.id, ownWallet.id));
    }
  }

  await db
    .update(wallets)
    .set({ balance: newBalance })
    .where(eq(wallets.id, input.walletId));
};

const doTransaction = async (
  db: PostgresJsDatabase,
  userId: string,
  input: z.infer<typeof transaction>
) => {
  const wallet = await db
    .select()
    .from(wallets)
    .where(and(eq(wallets.id, input.walletId), eq(wallets.userId, userId)))
    .then((res) => res[0]);

  if (!wallet) {
    throw new TRPCError({ message: "Wallet not found", code: "NOT_FOUND" });
  }

  if (input.amount > wallet.balance && input.type === TransactionType.DEBIT) {
    throw new TRPCError({ message: "Not enough balance", code: "BAD_REQUEST" });
  }

  let newBalance;

  if (input.type === TransactionType.CREDIT) {
    newBalance = wallet.balance + input.amount;
  } else if (input.type === TransactionType.DEBIT) {
    newBalance = wallet.balance - input.amount;

    if (input.internalWalletId) {
      const ownWallet = await db
        .select()
        .from(wallets)
        .where(eq(wallets.id, input.internalWalletId))
        .then((res) => res[0]);

      if (!ownWallet) {
        throw new TRPCError({ message: "Wallet not found", code: "NOT_FOUND" });
      }

      const ownWalletNewBalance = ownWallet.balance + input.amount;

      await db
        .update(wallets)
        .set({ balance: ownWalletNewBalance })
        .where(eq(wallets.id, ownWallet.id));
    }
  }

  await db
    .update(wallets)
    .set({ balance: newBalance })
    .where(eq(wallets.id, input.walletId));
};
