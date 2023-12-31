import { createTsForm, createUniqueFieldSchema } from "@ts-react/form";
import { z } from "zod";
import { Checkbox } from "./Checkbox";
import { DateInput } from "./DateInput";
import { NumberInput } from "./NumberInput";
import { SelectInput } from "./SelectInput";
import { TextInput } from "./TextInput";
import { TransactionType } from "../../server/db/schema/transactions";
import { TabInput } from "./TabInput";
import { PaymentNetwork, WalletType } from "../../server/db/schema/wallets";

export const dateStringSchema = createUniqueFieldSchema(
  z.string().datetime(),
  "dateStringSchema"
);

export const optionalDateStringSchema = createUniqueFieldSchema(
  z.string().datetime().optional(),
  "optionalDateStringSchema"
);

export const transactionTypeSchema = createUniqueFieldSchema(
  z.enum([
    TransactionType.EXPENSE,
    TransactionType.INCOME,
    TransactionType.TRANSFER,
  ]),
  "transactionTypeSchema"
);

export const walletTypeSchema = createUniqueFieldSchema(
  z.enum([
    WalletType.SAVINGS,
    WalletType.CREDIT,
    WalletType.CASH,
    WalletType.E_WALLET,
    WalletType.INVESTMENT,
  ]),
  "walletTypeSchema"
);

export const paymentNetworkSchema = createUniqueFieldSchema(
  z
    .enum([
      PaymentNetwork.MASTERCARD,
      PaymentNetwork.VISA,
      PaymentNetwork.JCB,
      PaymentNetwork.AMEX,
    ])
    .optional(),
  "paymentNetworkSchema"
);

export const entitySelectSchema = createUniqueFieldSchema(
  z.string().uuid().optional(),
  "entitySelectSchema"
);

const mapping = [
  [z.string(), TextInput] as const,
  [dateStringSchema, DateInput] as const,
  [optionalDateStringSchema, DateInput] as const,
  [transactionTypeSchema, TabInput] as const,
  [entitySelectSchema, SelectInput] as const,
  [walletTypeSchema, SelectInput] as const,
  [paymentNetworkSchema, SelectInput] as const,
  [z.number(), NumberInput] as const,
  [z.boolean(), Checkbox] as const,
] as const;

export const Form = createTsForm(mapping);
