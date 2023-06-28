import { TRPCError } from "@trpc/server";
import { type z } from "zod";
import { transaction, transactionWithId, withId } from "../../../types/zod";
import { protectedProcedure, router } from "../trpc";
import { TransactionType, transactions } from "../../db/schema/transactions";
import { wallets, transactionsInternalWallet } from "../../db/schema/wallets";
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
          name: transactions.name,
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
        .orderBy(desc(transactions.date));
    }),
  createTransaction: protectedProcedure
    .input(transaction)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (tx) => {
        try {
          await doTransaction(tx, ctx.session.user.id, input);

          await tx.insert(transactions).values({
            ...input,
            amount: input.amount.toString(),
            date: input.date ?? new Date().toISOString(),
          });
        } catch (e) {
          console.log(e);
          tx.rollback();
        }
      });
    }),
  editTransaction: protectedProcedure
    .input(transactionWithId)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (tx) => {
        try {
          // reset balances then edit transaction
          await resetBalances(tx, ctx.session.user.id, input);
          await doTransaction(tx, ctx.session.user.id, input);

          await tx
            .update(transactions)
            .set({
              name: input.name,
              amount: input.amount.toString(),
              description: input.description,
              date: input.date ?? new Date().toLocaleDateString(),
            })
            .where(eq(transactions.id, input.id));
        } catch (e) {
          console.log(e);
          tx.rollback();
        }
      });
    }),
  deleteTransaction: protectedProcedure
    .input(transactionWithId)
    .mutation(async ({ ctx, input }) => {
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
          console.log(e);
          tx.rollback();
        }
      });
    }),
});

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

  if (input.type === TransactionType.INCOME) {
    newBalance =
      Number.parseFloat(wallet.balance) - Number.parseFloat(transaction.amount);
  } else {
    newBalance =
      Number.parseFloat(wallet.balance) + Number.parseFloat(transaction.amount);

    if (input.internalWalletId) {
      const ownWallet = await db
        .select()
        .from(wallets)
        .where(eq(wallets.id, input.internalWalletId))
        .then((res) => res[0]);

      if (!ownWallet) {
        throw new TRPCError({ message: "Wallet not found", code: "NOT_FOUND" });
      }

      const ownWalletNewBalance =
        Number.parseFloat(ownWallet.balance) -
        Number.parseFloat(transaction.amount);

      await db
        .update(wallets)
        .set({ balance: ownWalletNewBalance.toString() })
        .where(eq(wallets.id, ownWallet.id));
    }
  }

  await db
    .update(wallets)
    .set({ balance: newBalance?.toString() })
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

  if (
    input.amount > Number.parseFloat(wallet.balance) &&
    input.type !== TransactionType.INCOME
  ) {
    throw new TRPCError({ message: "Not enough balance", code: "BAD_REQUEST" });
  }

  let newBalance;

  if (input.type === TransactionType.INCOME) {
    newBalance = Number.parseFloat(wallet.balance) + input.amount;
  } else {
    newBalance = Number.parseFloat(wallet.balance) - input.amount;

    if (input.internalWalletId) {
      const ownWallet = await db
        .select()
        .from(wallets)
        .where(eq(wallets.id, input.internalWalletId))
        .then((res) => res[0]);

      if (!ownWallet) {
        throw new TRPCError({ message: "Wallet not found", code: "NOT_FOUND" });
      }

      const ownWalletNewBalance =
        Number.parseFloat(ownWallet.balance) + input.amount;

      await db
        .update(wallets)
        .set({ balance: ownWalletNewBalance.toString() })
        .where(eq(wallets.id, ownWallet.id));
    }
  }

  await db
    .update(wallets)
    .set({ balance: newBalance?.toString() })
    .where(eq(wallets.id, input.walletId));
};
