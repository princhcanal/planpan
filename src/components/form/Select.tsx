import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Label } from "@radix-ui/react-label";
import { useTsController } from "@ts-react/form";
import classNames from "classnames";
import { Button } from "../ui/Button";

export interface LabelValuePair<T = string> {
  label: string;
  value: T;
}

interface SelectProps {
  options: LabelValuePair[];
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  hidden?: boolean;
}

export const Select = ({
  options,
  defaultValue,
  label,
  placeholder,
  hidden,
}: SelectProps) => {
  const { field, error, formState } = useTsController<string>();

  return (
    <fieldset className={classNames("mb-2", { hidden })}>
      <div className="mb-2">
        <Label
          className="text-xs font-medium text-gray-700 dark:text-gray-400"
          aria-required={true}
          htmlFor={field.value}
        >
          {label}
        </Label>
      </div>

      <SelectPrimitive.Root
        defaultValue={defaultValue}
        value={field.value ?? ""}
        onValueChange={(val) => field.onChange(val)}
      >
        <SelectPrimitive.Trigger asChild aria-label={label} id={field.value}>
          <Button className="mb-2 flex w-full justify-between">
            <span>
              {options.find((op) => op.value === field.value)?.label ??
                placeholder}
            </span>
            <SelectPrimitive.Icon className="ml-2">
              <ChevronDownIcon />
            </SelectPrimitive.Icon>
          </Button>
        </SelectPrimitive.Trigger>

        {/* TODO: fix width on content */}
        <SelectPrimitive.Content className="w-[26rem]">
          <SelectPrimitive.ScrollUpButton className="flex items-center justify-center text-gray-700 dark:text-gray-300">
            <ChevronUpIcon />
          </SelectPrimitive.ScrollUpButton>

          <SelectPrimitive.Viewport className="rounded-lg bg-white p-2 shadow-lg dark:bg-gray-900">
            <SelectPrimitive.Group>
              {options.map((opt, i) => (
                <SelectPrimitive.Item
                  key={`${opt.label}-${i}`}
                  value={opt.value}
                  className={classNames(
                    "relative flex items-center rounded-md px-8 py-2 text-sm font-medium text-gray-700 focus:bg-gray-100 dark:text-gray-300 dark:focus:bg-gray-800",
                    "radix-disabled:opacity-50",
                    "select-none focus:outline-none",
                    "cursor-pointer"
                  )}
                >
                  <SelectPrimitive.ItemText>
                    {opt.label}
                  </SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className="absolute left-2 inline-flex items-center">
                    <CheckIcon />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Group>
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="flex items-center justify-center text-gray-700 dark:text-gray-300">
            <ChevronDownIcon />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Root>

      {error?.errorMessage && (
        <p className="text-xs text-red-500">{error.errorMessage}</p>
      )}
      {formState.errors[""]?.message && (
        <p className="text-xs text-red-500">
          {formState.errors[""]?.message.toString()}
        </p>
      )}
    </fieldset>
  );
};
