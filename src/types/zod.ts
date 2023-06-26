import { z } from "zod";
import {
  entitySelectSchema,
  optionalDateStringSchema,
  transactionTypeSchema,
} from "../components/form/Form";
import { RecipientType } from "../server/db/schema/wallets";

export const withId = z.object({ id: z.string().uuid() });

export const wallet = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().optional(),
  balance: z.number().nonnegative(),
});

export const recipient = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().optional(),
  type: z.nativeEnum(RecipientType),
});

export const joinedWallet = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Required"),
});

export const transactionRefine = (data: z.infer<typeof transaction>) =>
  (!!data.internalWalletId && !data.recipientId) ||
  (!data.internalWalletId && !!data.recipientId);

export const transactionRefineMessage = "Either Wallet or Recipient required";

export const transaction = z.object({
  walletId: z.string().uuid(),
  type: transactionTypeSchema,
  internalWalletId: entitySelectSchema,
  recipientId: entitySelectSchema,
  sendToInternalWallet: z.boolean().optional(),
  amount: z.number().positive(),
  description: z.string().optional(),
  date: optionalDateStringSchema,
});

export const transactionWithId = transaction.merge(withId);

export const transactionWithJoinedWallets = z.object({
  date: z.string().datetime(),
  amount: z.number().positive(),
  description: z.string().nullish(),
  type: z.enum(["INCOMING", "OUTGOING"]),
  wallet: joinedWallet,
  internalWallet: joinedWallet.nullish(),
  recipient: joinedWallet.nullish(),
});
