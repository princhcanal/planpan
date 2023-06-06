import { ExternalGuapType, TransactionType } from "@prisma/client";
import { createTsForm, createUniqueFieldSchema } from "@ts-react/form";
import { z } from "zod";
import { Checkbox } from "./Checkbox";
import { DateInput } from "./DateInput";
import { NumberInput } from "./NumberInput";
import { Select } from "./Select";
import { TextInput } from "./TextInput";

export const externalGuapTypeSchema = createUniqueFieldSchema(
  z.enum([ExternalGuapType.BILLER, ExternalGuapType.PEER]),
  "externalGuapTypeSchema"
);

export const externalGuapSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullish(),
  type: externalGuapTypeSchema,
});

export const dateStringSchema = createUniqueFieldSchema(
  z.string().datetime(),
  "dateStringSchema"
);

export const nullishDateStringSchema = createUniqueFieldSchema(
  z.string().datetime().nullish(),
  "nullishDateStringSchema"
);

export const transactionTypeSchema = createUniqueFieldSchema(
  z.enum([TransactionType.OUTGOING, TransactionType.INCOMING]),
  "transactionTypeSchema"
);

export const entitySelectSchema = createUniqueFieldSchema(
  z.string().cuid().nullish(),
  "entitySelectSchema"
);

const mapping = [
  [z.string(), TextInput] as const,
  [dateStringSchema, DateInput] as const,
  [nullishDateStringSchema, DateInput] as const,
  [externalGuapTypeSchema, Select] as const,
  [transactionTypeSchema, Select] as const,
  [entitySelectSchema, Select] as const,
  [z.number(), NumberInput] as const,
  [z.boolean(), Checkbox] as const,
] as const;

export const Form = createTsForm(mapping);
