import { z } from "zod";
import {
  entitySelectSchema,
  optionalDateStringSchema,
  transactionTypeSchema,
} from "../components/form/Form";
import { ExternalGuapType } from "../server/db/schema/guaps";

export const withId = z.object({ id: z.string().uuid() });

export const guap = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().optional(),
  balance: z.number().nonnegative(),
});

export const externalGuap = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().optional(),
  type: z.nativeEnum(ExternalGuapType),
});

export const transactionRefine = (data: z.infer<typeof transaction>) =>
  (!!data.internalGuapId && !data.externalGuapId) ||
  (!data.internalGuapId && !!data.externalGuapId);

export const transactionRefineMessage = "Either Guap or Peer/Biller required";

export const transaction = z.object({
  guapId: z.string().uuid(),
  type: transactionTypeSchema,
  internalGuapId: entitySelectSchema,
  externalGuapId: entitySelectSchema,
  sendToGuap: z.boolean().optional(),
  amount: z.number().positive(),
  description: z.string().optional(),
  date: optionalDateStringSchema,
});

export const transactionWithId = transaction.merge(withId);
