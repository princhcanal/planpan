import { externalGuap, withId } from "../../../types/zod";
import { protectedProcedure, router } from "../trpc";
import { ExternalGuapType, externalGuaps } from "../../db/schema/guaps";
import { and, eq } from "drizzle-orm";

export const externalGuapRouter = router({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db
      .select()
      .from(externalGuaps)
      .where(eq(externalGuaps.userId, ctx.session.user.id));
  }),
  getAllPeers: protectedProcedure.query(({ ctx }) => {
    return ctx.db
      .select()
      .from(externalGuaps)
      .where(
        and(
          eq(externalGuaps.userId, ctx.session.user.id),
          eq(externalGuaps.type, ExternalGuapType.PEER)
        )
      );
  }),
  getAllBillers: protectedProcedure.query(({ ctx }) => {
    return ctx.db
      .select()
      .from(externalGuaps)
      .where(
        and(
          eq(externalGuaps.userId, ctx.session.user.id),
          eq(externalGuaps.type, ExternalGuapType.BILLER)
        )
      );
  }),
  getOne: protectedProcedure.input(withId).query(({ ctx, input }) => {
    return ctx.db
      .select()
      .from(externalGuaps)
      .where(
        and(
          eq(externalGuaps.id, input.id),
          eq(externalGuaps.userId, ctx.session.user.id)
        )
      );
  }),
  create: protectedProcedure.input(externalGuap).mutation(({ ctx, input }) => {
    return ctx.db
      .insert(externalGuaps)
      .values({ ...input, userId: ctx.session.user.id });
  }),
  edit: protectedProcedure
    .input(externalGuap.partial().merge(withId))
    .mutation(({ ctx, input }) => {
      return ctx.db
        .update(externalGuaps)
        .set(input)
        .where(
          and(
            eq(externalGuaps.id, input.id),
            eq(externalGuaps.userId, ctx.session.user.id)
          )
        );
    }),
  delete: protectedProcedure.input(withId).mutation(({ ctx, input }) => {
    return ctx.db
      .delete(externalGuaps)
      .where(
        and(
          eq(externalGuaps.id, input.id),
          eq(externalGuaps.userId, ctx.session.user.id)
        )
      );
  }),
});
