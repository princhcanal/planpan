import { useTsController } from "@ts-react/form";
import { NumericFormat } from "react-number-format";
import numeral from "numeral";
import { Label } from "@radix-ui/react-label";
import { inputClasses } from "../ui/Input";
import { cn } from "../../lib/utils";
import { Plus, type LucideIcon, Minus } from "lucide-react";

export interface NumberInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  max?: number;
  min?: number;
  label?: string;
  errorMessage?: string;
  currency?: string;
  sign?: LucideIcon;
}

export const NumberInput = ({
  className,
  label,
  placeholder,
  max,
  min,
  errorMessage,
  currency,
  ...props
}: NumberInputProps) => {
  const { field, error } = useTsController<number>();

  return (
    <fieldset className="mb-2">
      <div className="mb-2">
        <Label
          htmlFor={field.name}
          className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-400"
        >
          {label}
        </Label>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {!!props.sign && (
            <props.sign
              className={cn("font-semibold", {
                "text-success": props.sign === Plus,
                "text-destructive": props.sign === Minus,
              })}
              size="15"
            />
          )}
          {currency && (
            <span
              className={cn("text-2xl font-semibold", {
                "text-muted-foreground": props.sign === undefined,
                "text-success": props.sign === Plus,
                "text-destructive": props.sign === Minus,
              })}
            >
              {currency}
            </span>
          )}
        </div>
        <NumericFormat
          id={field.name}
          value={field.value ? field.value : ""}
          onChange={(e) => {
            field.onChange(numeral(e.target.value).value() ?? undefined);
          }}
          isAllowed={(values) => {
            const { floatValue } = values;

            if (floatValue === undefined) {
              return true;
            }

            let isMaxValid = true;
            let isMinValid = true;

            if (max !== undefined && floatValue > max) {
              isMaxValid = false;
            }

            if (min !== undefined && floatValue < min) {
              isMinValid = false;
            }

            return isMaxValid && isMinValid;
          }}
          thousandSeparator
          allowNegative={false}
          placeholder={placeholder}
          decimalScale={2}
          className={inputClasses(className)}
        />
      </div>

      {error?.errorMessage && (
        <span className="text-xs text-red-500">{error.errorMessage}</span>
      )}

      {errorMessage && (
        <span className="text-xs text-red-500">{errorMessage}</span>
      )}
    </fieldset>
  );
};
