import { Label } from "@radix-ui/react-label";
import { useTsController } from "@ts-react/form";
import classNames from "classnames";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/Select";
import type { LucideIcon } from "lucide-react";

export interface LabelValuePair<T = string> {
  label: string;
  value: T;
  icon?: LucideIcon;
}

interface SelectInputProps {
  options: LabelValuePair[];
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  hidden?: boolean;
  errorMessage?: string;
  disabled?: boolean;
}

export const SelectInput = ({
  options,
  defaultValue,
  label,
  placeholder,
  hidden,
  errorMessage,
  disabled,
}: SelectInputProps) => {
  const { field, error } = useTsController<string>();
  console.log("options:", options);
  console.log("field.value:", field.value);

  return (
    <fieldset className={classNames("mb-2", { hidden })}>
      <div className="mb-2">
        <Label
          className="text-xs font-medium text-gray-700 dark:text-gray-400"
          aria-required={true}
          htmlFor={field.name}
        >
          {label}
        </Label>
      </div>

      <Select
        defaultValue={defaultValue}
        value={field.value ?? ""}
        onValueChange={(val) => field.onChange(val)}
        disabled={disabled}
      >
        <SelectTrigger>
          {options.find((op) => op.value === field.value)?.label ?? placeholder}
        </SelectTrigger>

        <SelectContent id={field.name}>
          {options.map((opt, i) => (
            <SelectItem
              key={`${opt.label}-${i}`}
              value={opt.value}
              className="cursor-pointer"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error?.errorMessage && (
        <p className="mt-2 text-xs text-red-500">{error.errorMessage}</p>
      )}

      {errorMessage && (
        <p className="mt-2 text-xs text-red-500">{errorMessage}</p>
      )}
    </fieldset>
  );
};
