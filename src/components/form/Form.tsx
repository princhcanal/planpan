import { createTsForm } from "@ts-react/form";
import { z } from "zod";
import { NumberInput } from "./NumberInput";
import { Select } from "./Select";
import { TextInput } from "./TextInput";

const mapping = [
  [z.string(), TextInput] as const,
  [z.enum(["BILLER", "PEER"]), Select] as const,
  [z.number(), NumberInput] as const,
] as const;

export const Form = createTsForm(mapping);
