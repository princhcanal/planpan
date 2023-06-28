import { Label } from "@radix-ui/react-label";
import { useTsController } from "@ts-react/form";
import { Textarea } from "../ui/Textarea";
import { inputClasses } from "../ui/Input";

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  enumValues: unknown;
}

export const TextInput = ({
  className,
  type,
  label,
  ...props
}: TextInputProps) => {
  delete props.enumValues; // caused "React does not recognize the 'enumValues' prop on a DOM element"

  const { field, error } = useTsController<string>();

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
        <Textarea
          id={field.name}
          value={field.value}
          onChange={(e) => {
            field.onChange(e.target.value);
          }}
          className={inputClasses(className)}
          placeholder={props.placeholder}
        />
      ) : (
        <input
          id={field.name}
          value={field.value ? field.value : ""} // conditional to prevent "uncontrolled to controlled" react warning
          onChange={(e) => {
            field.onChange(e.target.value);
          }}
          type={type ?? "text"}
          className={inputClasses(className)}
          {...props}
        />
      )}

      {error?.errorMessage && (
        <span className="text-xs text-red-500">{error.errorMessage}</span>
      )}
    </fieldset>
  );
};
