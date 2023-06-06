import { ExternalGuapType } from "@prisma/client";
import { z } from "zod";
import {
  entitySelectSchema,
  nullishDateStringSchema,
  transactionTypeSchema,
} from "../components/form/Form";

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

export const transactionRefine = (data: z.infer<typeof transaction>) =>
  (!!data.internalGuapId && !data.externalGuapId) ||
  (!data.internalGuapId && !!data.externalGuapId);

export const transactionRefineMessage = "Either Guap or Peer/Biller required";

export const transaction = z.object({
  guapId: z.string().cuid(),
  type: transactionTypeSchema,
  internalGuapId: entitySelectSchema,
  externalGuapId: entitySelectSchema,
  sendToGuap: z.boolean().nullish(),
  amount: z.number().positive(),
  description: z.string().nullish(),
  date: nullishDateStringSchema,
});

export const transactionWithId = transaction.merge(withId);