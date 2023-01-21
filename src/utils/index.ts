import type { LabelValuePair } from "../components/form/Select";

export const mapEnumToLabelValuePair = (obj: any): LabelValuePair<any>[] => {
  return Object.entries<unknown>(obj).map((entry) => ({
    label: entry[0],
    value: entry[1],
  }));
};
