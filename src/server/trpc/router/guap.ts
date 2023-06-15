import { and, asc, eq } from "drizzle-orm";
import { guap, withId } from "../../../types/zod";
import { guaps } from "../../db/schema/guaps";
import { protectedProcedure, router } from "../trpc";

export const guapRouter = router({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db
      .select()
      .from(guaps)
      .where(eq(guaps.userId, ctx.session.user.id))
      .orderBy(asc(guaps.createdAt));
  }),
  getOne: protectedProcedure.input(withId).query(async ({ ctx, input }) => {
    return ctx.db
      .select()
      .from(guaps)
      .where(and(eq(guaps.id, input.id), eq(guaps.userId, ctx.session.user.id)))
      .then((res) => res[0]);
  }),
  create: protectedProcedure.input(guap).mutation(({ ctx, input }) => {
    return ctx.db
      .insert(guaps)
      .values({ ...input, userId: ctx.session.user.id });
  }),
  edit: protectedProcedure
    .input(guap.partial().merge(withId))
    .mutation(({ ctx, input }) => {
      return ctx.db
        .update(guaps)
        .set(input)
        .where(
          and(eq(guaps.id, input.id), eq(guaps.userId, ctx.session.user.id))
        );
    }),
  delete: protectedProcedure.input(withId).mutation(({ ctx, input }) => {
    return ctx.db
      .delete(guaps)
      .where(
        and(eq(guaps.id, input.id), eq(guaps.userId, ctx.session.user.id))
      );
  }),
});
