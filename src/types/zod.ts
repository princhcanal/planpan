import { ExternalGuapType, TransactionType } from "@prisma/client";
import { z } from "zod";
import { dateStringSchema } from "../components/form/Form";

export const withId = z.object({ id: z.string().cuid() });

export const guap = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().nullish(),
  balance: z.number().nonnegative(),
});

export const externalGuap = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().nullish(),
  type: z.nativeEnum(ExternalGuapType),
});

// TODO: refactor refinement
export const transaction = z
  .object({
    date: dateStringSchema,
    amount: z.number().positive(),
    description: z.string().nullish(),
    guapId: z.string().cuid(),
    internalGuapId: z.string().cuid().nullish(),
    externalGuapId: z.string().cuid().nullish(),
    type: z.nativeEnum(TransactionType),
  })
  .refine(
    (data) =>
      (!!data.internalGuapId && !data.externalGuapId) ||
      (!data.internalGuapId && !!data.externalGuapId),
    {
      message: "Either Guap or Peer/Biller required",
    }
  );

export const transactionWithId = z
  .object({
    date: dateStringSchema,
    amount: z.number().positive(),
    description: z.string().nullish(),
    guapId: z.string().cuid(),
    internalGuapId: z.string().cuid().nullish(),
    externalGuapId: z.string().cuid().nullish(),
    type: z.nativeEnum(TransactionType),
  })
  .merge(withId)
  .refine(
    (data) =>
      (!!data.internalGuapId && !data.externalGuapId) ||
      (!data.internalGuapId && !!data.externalGuapId),
    {
      message: "Either Guap or Peer/Biller required",
    }
  );
