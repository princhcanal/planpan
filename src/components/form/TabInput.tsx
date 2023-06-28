import { useTsController } from "@ts-react/form";
import type { LabelValuePair } from "./SelectInput";
import { Tabs, TabsList, TabsTrigger } from "../ui/Tabs";
import { cn } from "../../lib/utils";

interface TabInputProps {
  options: LabelValuePair[];
  defaultValue?: string;
  hidden?: boolean;
  errorMessage?: string;
  disabled?: boolean;
}

export const TabInput = ({
  options,
  defaultValue,
  hidden,
  errorMessage,
  disabled,
}: TabInputProps) => {
  const { field, error } = useTsController<string>();

  return (
    <fieldset className={cn("mb-2", { hidden })}>
      <Tabs
        defaultValue={defaultValue}
        onValueChange={(val) => field.onChange(val)}
        className={cn({ "cursor-not-allowed": disabled })}
      >
        <TabsList className="w-full">
          {options.map((opt, i) => (
            <TabsTrigger
              className="w-full"
              value={opt.value}
              key={`${opt.label}-${i}`}
              disabled={disabled}
            >
              <div className="flex items-center">
                {opt.icon && <opt.icon className="mr-2" size="15" />}
                <span>{opt.label}</span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {error?.errorMessage && (
        <p className="mt-2 text-xs text-red-500">{error.errorMessage}</p>
      )}

      {errorMessage && (
        <p className="mt-2 text-xs text-red-500">{errorMessage}</p>
      )}
    </fieldset>
  );
};
