import { useTsController } from "@ts-react/form";
import { NumericFormat } from "react-number-format";
import numeral from "numeral";
import { Label } from "@radix-ui/react-label";
import { inputClasses } from "../ui/Input";

export interface NumberInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  max?: number;
  min?: number;
  label?: string;
  errorMessage?: string;
  currency?: string;
}

export const NumberInput = ({
  className,
  label,
  placeholder,
  max,
  min,
  errorMessage,
  currency,
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
        {currency && <span className="text-2xl font-semibold">{currency}</span>}
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
