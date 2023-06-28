import type { LucideIcon } from "lucide-react";

interface LabelValuePair<T> {
  label: string;
  value: T;
  icon?: LucideIcon;
}

export const mapEnumToLabelValuePair = (
  obj: any,
  icons?: LucideIcon[]
): LabelValuePair<any>[] => {
  return Object.entries<unknown>(obj).map((entry, i) => ({
    label: entry[0],
    value: entry[1],
    icon: icons && icons[i] ? icons[i] : undefined,
  }));
};
