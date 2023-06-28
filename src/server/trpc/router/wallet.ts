import { and, asc, eq } from "drizzle-orm";
import { wallet, withId } from "../../../types/zod";
import { wallets } from "../../db/schema/wallets";
import { protectedProcedure, router } from "../trpc";
import type { PostgresError } from "postgres";
import { PostgresErrorCodes } from "../../../utils/postgresErrorCodes";
import { TRPCError } from "@trpc/server";

export const walletRouter = router({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, ctx.session.user.id))
      .orderBy(asc(wallets.createdAt));
  }),
  getOne: protectedProcedure.input(withId).query(async ({ ctx, input }) => {
    return ctx.db
      .select()
      .from(wallets)
      .where(
        and(eq(wallets.id, input.id), eq(wallets.userId, ctx.session.user.id))
      )
      .then((res) => res[0]);
  }),
  create: protectedProcedure.input(wallet).mutation(({ ctx, input }) => {
    return ctx.db.insert(wallets).values({
      ...input,
      balance: input.balance.toString(),
      userId: ctx.session.user.id,
    });
  }),
  edit: protectedProcedure
    .input(wallet.partial().merge(withId))
    .mutation(({ ctx, input }) => {
      return ctx.db
        .update(wallets)
        .set({ ...input, balance: input.balance?.toString() })
        .where(
          and(eq(wallets.id, input.id), eq(wallets.userId, ctx.session.user.id))
        );
    }),
  delete: protectedProcedure.input(withId).mutation(async ({ ctx, input }) => {
    try {
      await ctx.db
        .delete(wallets)
        .where(
          and(eq(wallets.id, input.id), eq(wallets.userId, ctx.session.user.id))
        );
    } catch (e) {
      if (e instanceof Error) {
        if (e.name === "PostgresError") {
          const error = e as PostgresError;
          if (error.code === PostgresErrorCodes.FOREIGN_KEY_VIOLATION) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Cannot delete wallets that are part of transactions",
            });
          }
        }
      }
    }
  }),
});
