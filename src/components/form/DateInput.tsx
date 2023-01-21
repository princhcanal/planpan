import { Label } from "@radix-ui/react-label";
import { useTsController } from "@ts-react/form";
import className from "classnames";

interface DateInputProps {
  label?: string;
  hidden?: boolean;
}

export const DateInput = ({ label, hidden }: DateInputProps) => {
  const { field, error } = useTsController<string>();

  return (
    <fieldset className={className("mb-2", { hidden })}>
      <div className="mb-2">
        <Label
          htmlFor={field.name}
          className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-400"
        >
          {label}
        </Label>
      </div>

      <input
        value={field.value ? field.value.split("T")[0] : ""}
        onChange={(e) => {
          field.onChange(new Date(e.target.value).toISOString());
        }}
        id={field.name}
        type="date"
        className={className(
          "block w-full rounded-md p-2",
          "text-sm text-gray-700 placeholder:text-gray-500 dark:text-gray-400 dark:placeholder:text-gray-600",
          "border border-gray-400 focus-visible:border-transparent dark:border-gray-700 dark:bg-gray-800",
          "focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75",
          "resize-none"
        )}
      />

      {error?.errorMessage && (
        <span className="text-xs text-red-500">{error.errorMessage}</span>
      )}
    </fieldset>
  );
};
