import { ExternalGuapType } from "@prisma/client";
import { z } from "zod";

export const withId = z.object({ id: z.string().cuid() });

export const guap = z.object({
  name: z.string(),
  description: z.string().nullable(),
  balance: z.number().nonnegative(),
});

export const externalGuap = z.object({
  name: z.string(),
  description: z.string().nullable(),
  type: z.nativeEnum(ExternalGuapType),
});

// used for react-ts-form
export const externalGuapSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  type: z.enum([ExternalGuapType.PEER, ExternalGuapType.BILLER]),
});
