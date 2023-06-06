import { type PrismaClient, TransactionType } from "@prisma/client";
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

export const transactionRouter = router({
  getAllTransactions: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.transaction.findMany({
      where: { guap: { userId: ctx.session.user.id } },
    });
  }),
  getTransactionsByGuap: protectedProcedure
    .input(withId)
    .query(({ ctx, input }) => {
      return ctx.prisma.transaction.findMany({
        where: {
          OR: [
            { guapId: input.id, guap: { userId: ctx.session.user.id } },
            {
              internalGuapId: input.id,
              internalGuap: { userId: ctx.session.user.id },
            },
          ],
        },
        include: { guap: true, externalGuap: true, internalGuap: true },
        orderBy: { date: "desc" },
      });
    }),
  createTransaction: protectedProcedure
    .input(transaction.refine(transactionRefine, transactionRefineMessage))
    .mutation(async ({ ctx, input }) => {
      preValidate(input);

      delete input.sendToGuap;

      await doTransaction(ctx.prisma, ctx.session.user.id, input);

      return ctx.prisma.transaction.create({
        data: { ...input, date: input.date ?? new Date().toISOString() },
      });
    }),
  editTransaction: protectedProcedure
    .input(
      transactionWithId.refine(transactionRefine, transactionRefineMessage)
    )
    .mutation(async ({ ctx, input }) => {
      preValidate(input);

      delete input.sendToGuap;

      // reset balances then edit transaction
      await resetBalances(ctx.prisma, ctx.session.user.id, input);
      await doTransaction(ctx.prisma, ctx.session.user.id, input);

      return ctx.prisma.transaction.updateMany({
        where: { id: input.id, guap: { userId: ctx.session.user.id } },
        data: { ...input, date: input.date ?? new Date().toISOString() },
      });
    }),
  deleteTransaction: protectedProcedure
    .input(
      transactionWithId.refine(transactionRefine, transactionRefineMessage)
    )
    .mutation(async ({ ctx, input }) => {
      // reset balances then delete transaction
      await resetBalances(ctx.prisma, ctx.session.user.id, input);

      return ctx.prisma.transaction.delete({
        where: { id: input.id },
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
  prisma: PrismaClient,
  userId: string,
  input: z.infer<typeof transactionWithId>
) => {
  const transaction = await prisma.transaction.findUniqueOrThrow({
    where: { id: input.id },
  });
  const guap = await prisma.guap.findFirstOrThrow({
    where: { id: input.guapId, userId },
  });
  let newBalance;

  if (input.type === TransactionType.INCOMING) {
    newBalance = guap.balance - transaction.amount;
  } else if (input.type === TransactionType.OUTGOING) {
    newBalance = guap.balance + transaction.amount;

    if (input.internalGuapId) {
      const ownGuap = await prisma.guap.findFirstOrThrow({
        where: { id: input.internalGuapId },
      });

      const ownGuapNewBalance = ownGuap.balance - transaction.amount;

      await prisma.guap.update({
        where: { id: ownGuap.id },
        data: { balance: ownGuapNewBalance },
      });
    }
  }

  await prisma.guap.update({
    where: { id: input.guapId },
    data: { balance: newBalance },
  });
};

const doTransaction = async (
  prisma: PrismaClient,
  userId: string,
  input: z.infer<typeof transaction>
) => {
  const guap = await prisma.guap.findFirstOrThrow({
    where: { id: input.guapId, userId },
  });

  if (input.amount > guap.balance && input.type === TransactionType.OUTGOING) {
    throw new TRPCError({ message: "Not enough balance", code: "BAD_REQUEST" });
  }

  let newBalance;

  if (input.type === TransactionType.INCOMING) {
    newBalance = guap.balance + input.amount;
  } else if (input.type === TransactionType.OUTGOING) {
    newBalance = guap.balance - input.amount;

    if (input.internalGuapId) {
      const ownGuap = await prisma.guap.findFirstOrThrow({
        where: { id: input.internalGuapId },
      });

      const ownGuapNewBalance = ownGuap.balance + input.amount;

      await prisma.guap.update({
        where: { id: ownGuap.id },
        data: { balance: ownGuapNewBalance },
      });
    }
  }

  await prisma.guap.update({
    where: { id: input.guapId },
    data: { balance: newBalance },
  });
};
