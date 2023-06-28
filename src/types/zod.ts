import { z } from "zod";
import {
  entitySelectSchema,
  optionalDateStringSchema,
  transactionTypeSchema,
} from "../components/form/Form";
import { TransactionType } from "../server/db/schema/transactions";

export const withId = z.object({ id: z.string().uuid() });

export const wallet = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().optional(),
  balance: z.number().nonnegative(),
});

export const joinedWallet = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Required"),
});

export const transactionRefine = (data: z.infer<typeof transaction>) =>
  data.type === TransactionType.TRANSFER ? !!data.internalWalletId : true;

export const transactionRefineMessage = "Required";

export const transaction = z.object({
  walletId: z.string().uuid(),
  type: transactionTypeSchema,
  internalWalletId: entitySelectSchema,
  name: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().optional(),
  date: optionalDateStringSchema,
});

export const transactionWithId = transaction.merge(withId);

export const transactionWithJoinedWallets = z.object({
  date: z.string().datetime(),
  amount: z.number().positive(),
  name: z.string().min(1),
  description: z.string().nullish(),
  type: z.enum(["EXPENSE", "INCOME", "TRANSFER"]),
  wallet: joinedWallet,
  internalWallet: joinedWallet.nullish(),
});
