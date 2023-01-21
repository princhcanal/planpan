import { Label } from "@radix-ui/react-label";
import { useTsController } from "@ts-react/form";
import className from "classnames";
import { type HTMLInputTypeAttribute } from "react";

interface TextInputProps {
  type?: HTMLInputTypeAttribute | "textarea";
  label?: string;
  placeholder?: string;
}

export const TextInput = ({ type, label, placeholder }: TextInputProps) => {
  const { field, error } = useTsController<string>();
  const textInputClasses = className(
    "block w-full rounded-md p-2",
    "text-sm text-gray-700 placeholder:text-gray-500 dark:text-gray-400 dark:placeholder:text-gray-600",
    "border border-gray-400 focus-visible:border-transparent dark:border-gray-700 dark:bg-gray-800",
    "focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75",
    "resize-none"
  );

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

      {type === "textarea" ? (
        <textarea
          value={field.value} // conditional to prevent "uncontrolled to controlled" react warning
          onChange={(e) => {
            field.onChange(e.target.value);
          }}
          id={field.name}
          placeholder={placeholder}
          className={textInputClasses}
        ></textarea>
      ) : (
        <input
          value={field.value ? field.value : ""} // conditional to prevent "uncontrolled to controlled" react warning
          onChange={(e) => {
            field.onChange(e.target.value);
          }}
          id={field.name}
          type={type ?? "text"}
          placeholder={placeholder}
          className={textInputClasses}
        />
      )}

      {error?.errorMessage && (
        <span className="text-xs text-red-500">{error.errorMessage}</span>
      )}
    </fieldset>
  );
};
