import { useTsController } from "@ts-react/form";
import className from "classnames";
import { NumericFormat } from "react-number-format";
import numeral from "numeral";
import { Label } from "@radix-ui/react-label";
import { TextInput } from "./TextInput";

interface NumberInputProps {
  label?: string;
  placeholder?: string;
  max?: number;
  min?: number;
  errorMessage?: string;
}

export const NumberInput = ({
  label,
  placeholder,
  max,
  min,
  errorMessage,
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

      <NumericFormat
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
        id={field.name}
        thousandSeparator
        allowNegative={false}
        placeholder={placeholder}
        decimalScale={2}
        className={className(
          "mt-1 block w-full rounded-md p-2",
          "text-sm text-gray-700 placeholder:text-gray-500 dark:text-gray-400 dark:placeholder:text-gray-600",
          "border border-gray-400 focus-visible:border-transparent dark:border-gray-700 dark:bg-gray-800",
          "focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75"
        )}
      />

      {error?.errorMessage && (
        <span className="text-xs text-red-500">{error.errorMessage}</span>
      )}

      {errorMessage && (
        <span className="text-xs text-red-500">{errorMessage}</span>
      )}
    </fieldset>
  );
};
