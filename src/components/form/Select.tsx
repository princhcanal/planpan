import { type ExternalGuapType } from "@prisma/client";
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
import { Transition } from "@headlessui/react";
import { Fragment, useRef } from "react";

interface SelectProps {
  options: string[];
  label: string;
  defaultValue?: string;
  hidden?: boolean;
}

export const Select = ({
  options,
  defaultValue,
  label,
  hidden,
}: SelectProps) => {
  const { field, error } = useTsController<ExternalGuapType>();

  return (
    <fieldset className={classNames("mb-2", { hidden: hidden })}>
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
        value={field.value}
        onValueChange={(val) => field.onChange(val as ExternalGuapType)}
      >
        <SelectPrimitive.Trigger asChild aria-label={label} id={field.value}>
          <Button className="flex w-full justify-between">
            <span>{field.value}</span>
            <SelectPrimitive.Icon className="ml-2">
              <ChevronDownIcon />
            </SelectPrimitive.Icon>
          </Button>
        </SelectPrimitive.Trigger>

        {/* TODO: fix width on content */}
        <SelectPrimitive.Content className="w-56">
          <SelectPrimitive.ScrollUpButton className="flex items-center justify-center text-gray-700 dark:text-gray-300">
            <ChevronUpIcon />
          </SelectPrimitive.ScrollUpButton>

          <SelectPrimitive.Viewport className="rounded-lg bg-white p-2 shadow-lg dark:bg-gray-800">
            <SelectPrimitive.Group>
              {options.map((opt, i) => (
                <SelectPrimitive.Item
                  key={`${opt}-${i}`}
                  value={opt}
                  className={classNames(
                    "relative flex items-center rounded-md px-8 py-2 text-sm font-medium text-gray-700 focus:bg-gray-100 dark:text-gray-300 dark:focus:bg-gray-900",
                    "radix-disabled:opacity-50",
                    "select-none focus:outline-none",
                    "cursor-pointer"
                  )}
                >
                  <SelectPrimitive.ItemText>{opt}</SelectPrimitive.ItemText>
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
        <span className="text-xs text-red-500">{error.errorMessage}</span>
      )}
    </fieldset>
  );
};
