import { ExternalGuapType } from "@prisma/client";
import { externalGuap, withId } from "../../../types/zod";
import { protectedProcedure, router } from "../trpc";

export const externalGuapRouter = router({
  getAllPeers: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.externalGuap.findMany({
      where: { userId: ctx.session.user.id, type: ExternalGuapType.PEER },
    });
  }),
  getAllBillers: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.externalGuap.findMany({
      where: { userId: ctx.session.user.id, type: ExternalGuapType.BILLER },
    });
  }),
  getOne: protectedProcedure.input(withId).query(({ ctx, input }) => {
    return ctx.prisma.externalGuap.findFirst({
      where: { id: input.id, userId: ctx.session.user.id },
    });
  }),
  create: protectedProcedure.input(externalGuap).mutation(({ ctx, input }) => {
    return ctx.prisma.externalGuap.create({
      data: { ...input, userId: ctx.session.user.id },
    });
  }),
  edit: protectedProcedure
    .input(externalGuap.partial().merge(withId))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.externalGuap.updateMany({
        where: { id: input.id, userId: ctx.session.user.id },
        data: input,
      });
    }),
  delete: protectedProcedure.input(withId).mutation(({ ctx, input }) => {
    return ctx.prisma.externalGuap.deleteMany({
      where: { id: input.id, userId: ctx.session.user.id },
    });
  }),
});
