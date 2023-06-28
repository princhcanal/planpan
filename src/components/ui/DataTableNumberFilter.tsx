import type { Column } from "@tanstack/react-table";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { Badge } from "./Badge";
import { Button } from "./Button";
import type { LucideIcon } from "lucide-react";
import { Separator } from "./Separator";
import numeral from "numeral";
import { NumericFormat } from "react-number-format";
import { inputClasses } from "./Input";
import { useState } from "react";

interface DataTableNumberFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  currency?: string;
  icon?: LucideIcon;
}

export interface NumberRange {
  min?: number;
  max?: number;
}

export function DataTableNumberFilter<TData, TValue>({
  column,
  title,
  currency,
  ...props
}: DataTableNumberFilterProps<TData, TValue>) {
  const value = column?.getFilterValue() as NumberRange | undefined;
  const [minVal, setMinVal] = useState<number | undefined>(undefined);
  const [maxVal, setMaxVal] = useState<number | undefined>(undefined);
  const max = 1_000_000_000_000;
  const min = -1_000_000_000_000;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-52 border-dashed text-muted-foreground sm:w-auto lg:h-8"
        >
          {props.icon && <props.icon className="mr-2 h-4 w-4" />}
          {title}
          {value?.min !== undefined && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal"
              >
                {currency && <span>{currency} </span>}
                <span>{numeral(value?.min).format("0,0.00")}</span>
                {value?.max && (
                  <>
                    <span> - </span>
                    {currency && <span>{currency} </span>}
                    <span>{numeral(value?.max).format("0,0.00")}</span>
                  </>
                )}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0" align="start">
        <div className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-2">
            {currency && (
              <span className="text-xl font-semibold">{currency}</span>
            )}
            <NumericFormat
              id={"min" + column?.id}
              value={minVal ?? ""}
              onChange={(e) => {
                const val = numeral(e.target.value).value();
                setMinVal(val ?? undefined);

                if (
                  (val === undefined || val === null) &&
                  (value?.max === undefined || value?.max === null)
                ) {
                  return column?.setFilterValue(undefined);
                }

                column?.setFilterValue({
                  min: val,
                  max: value?.max,
                });
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
              placeholder="Min"
              decimalScale={2}
              className={inputClasses("h-8")}
            />
          </div>

          <p>-</p>

          <div className="flex items-center gap-2">
            {currency && (
              <span className="text-xl font-semibold">{currency}</span>
            )}
            <NumericFormat
              id={"max" + column?.id}
              value={maxVal ?? ""}
              onChange={(e) => {
                const val = numeral(e.target.value).value();
                setMaxVal(val ?? undefined);

                if (
                  (val === undefined || val === null) &&
                  (value?.min === undefined || value?.min === null)
                ) {
                  return column?.setFilterValue(undefined);
                }

                column?.setFilterValue({
                  min: value?.min ?? 0,
                  max: val,
                });
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
              placeholder="Max"
              decimalScale={2}
              className={inputClasses("h-8")}
            />
          </div>
        </div>
        {value && (
          <>
            <Separator />
            <div className="p-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setMinVal(undefined);
                  setMaxVal(undefined);
                  column?.setFilterValue(undefined);
                }}
              >
                Clear filter
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
