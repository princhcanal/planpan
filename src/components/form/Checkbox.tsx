import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as LabelPrimitive from "@radix-ui/react-label";
import { useTsController } from "@ts-react/form";
import { Check } from "lucide-react";
import React from "react";
import { cn } from "../../lib/utils";

interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  text: string;
}

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, text, ...props }, ref) => {
  const { field } = useTsController<boolean>();

  return (
    <fieldset className="flex items-center justify-end">
      <CheckboxPrimitive.Root
        id={field.name}
        ref={ref}
        checked={field.value}
        onCheckedChange={(val) => field.onChange(val as boolean)}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          className={cn("flex items-center justify-center text-current")}
        >
          <Check className="h-4 w-4" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>

      <LabelPrimitive.Label
        htmlFor={field.name}
        className="ml-3 cursor-pointer select-none text-sm font-medium text-gray-900 dark:text-gray-100"
      >
        {text}
      </LabelPrimitive.Label>
    </fieldset>
  );
});

Checkbox.displayName = CheckboxPrimitive.Root.displayName;
