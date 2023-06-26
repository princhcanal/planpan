import { recipient, withId } from "../../../types/zod";
import { protectedProcedure, router } from "../trpc";
import { RecipientType, recipients } from "../../db/schema/wallets";
import { and, asc, eq } from "drizzle-orm";

export const recipientRouter = router({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db
      .select()
      .from(recipients)
      .where(eq(recipients.userId, ctx.session.user.id))
      .orderBy(asc(recipients.createdAt));
  }),
  getAllPeers: protectedProcedure.query(({ ctx }) => {
    return ctx.db
      .select()
      .from(recipients)
      .where(
        and(
          eq(recipients.userId, ctx.session.user.id),
          eq(recipients.type, RecipientType.PEER)
        )
      );
  }),
  getAllBillers: protectedProcedure.query(({ ctx }) => {
    return ctx.db
      .select()
      .from(recipients)
      .where(
        and(
          eq(recipients.userId, ctx.session.user.id),
          eq(recipients.type, RecipientType.BILLER)
        )
      );
  }),
  getOne: protectedProcedure.input(withId).query(({ ctx, input }) => {
    return ctx.db
      .select()
      .from(recipients)
      .where(
        and(
          eq(recipients.id, input.id),
          eq(recipients.userId, ctx.session.user.id)
        )
      );
  }),
  create: protectedProcedure.input(recipient).mutation(({ ctx, input }) => {
    return ctx.db
      .insert(recipients)
      .values({ ...input, userId: ctx.session.user.id });
  }),
  edit: protectedProcedure
    .input(recipient.partial().merge(withId))
    .mutation(({ ctx, input }) => {
      return ctx.db
        .update(recipients)
        .set(input)
        .where(
          and(
            eq(recipients.id, input.id),
            eq(recipients.userId, ctx.session.user.id)
          )
        );
    }),
  delete: protectedProcedure.input(withId).mutation(({ ctx, input }) => {
    return ctx.db
      .delete(recipients)
      .where(
        and(
          eq(recipients.id, input.id),
          eq(recipients.userId, ctx.session.user.id)
        )
      );
  }),
});
