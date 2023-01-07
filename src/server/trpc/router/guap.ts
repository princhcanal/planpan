import { guap, withId } from "../../../types/zod";
import { protectedProcedure, router } from "../trpc";

export const guapRouter = router({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.guap.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "asc" },
    });
  }),
  getOne: protectedProcedure.input(withId).query(({ ctx, input }) => {
    return ctx.prisma.guap.findFirst({
      where: { id: input.id, userId: ctx.session.user.id },
    });
  }),
  create: protectedProcedure.input(guap).mutation(({ ctx, input }) => {
    return ctx.prisma.guap.create({
      data: { ...input, userId: ctx.session.user.id },
    });
  }),
  edit: protectedProcedure
    .input(guap.partial().merge(withId))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.guap.updateMany({
        where: { id: input.id, userId: ctx.session.user.id },
        data: input,
      });
    }),
  delete: protectedProcedure.input(withId).mutation(({ ctx, input }) => {
    return ctx.prisma.guap.deleteMany({
      where: { id: input.id, userId: ctx.session.user.id },
    });
  }),
});
