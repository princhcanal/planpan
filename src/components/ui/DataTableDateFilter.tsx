import type { Column } from "@tanstack/react-table";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "./Popover";
import { Button } from "./Button";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "./Calendar";
import { Separator } from "./Separator";

interface DataTableFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
}

export function DataTableDateFilter<TData, TValue>({
  column,
}: DataTableFilterProps<TData, TValue>) {
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  return (
    <div className={cn("grid gap-2")}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "justify-start whitespace-nowrap text-left font-normal lg:h-8",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Date Range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(val) => {
              setDate(val);
              if (val === undefined) {
                column?.setFilterValue({ from: undefined, to: undefined });
              } else {
                column?.setFilterValue(val);
              }
            }}
            numberOfMonths={2}
          />
          {date && (
            <>
              <Separator />
              <div className="p-1">
                <Button
                  variant="ghost"
                  className="w-full"
                  size="sm"
                  onClick={() => {
                    setDate(undefined);
                    column?.setFilterValue({ from: undefined, to: undefined });
                  }}
                >
                  Clear filter
                </Button>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
