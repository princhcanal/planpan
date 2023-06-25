"use client";

import { type Table } from "@tanstack/react-table";
import { type LucideIcon, X } from "lucide-react";

import { Button } from "./Button";
import { Input } from "./Input";
import { DataTableViewOptions } from "./DataTableViewOptions";

import { DataTableFacetedFilter } from "./DataTableFacedtedFilter";
import { DataTableDateFilter } from "./DataTableDateFilter";
import { DataTableNumberFilter } from "./DataTableNumberFilter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  multiSelectFilters?: DataTableFilter[];
  searchFilters?: SearchFilter[];
  dateFilter?: DateFilter;
  numberFilter?: NumberFilter;
}

export interface DataTableFilter {
  columnId?: string;
  title?: string;
  options: {
    label: string;
    value: string;
    icon?: LucideIcon;
  }[];
  icon?: LucideIcon;
}

export interface SearchFilter {
  columnId: string;
  placeholder?: string;
}

export interface DateFilter {
  columnId: string;
}

export interface NumberFilter {
  columnId: string;
  title?: string;
  currency?: string;
  icon?: LucideIcon;
}

export function DataTableToolbar<TData>({
  table,
  multiSelectFilters,
  searchFilters,
  dateFilter,
  numberFilter,
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getPreFilteredRowModel().rows.length >
    table.getFilteredRowModel().rows.length;

  return (
    <div className="flex w-full items-center justify-between overflow-x-auto">
      <div className="flex flex-1 items-center space-x-2">
        {searchFilters &&
          searchFilters.map((s) => (
            <Input
              key={s.columnId}
              placeholder={s.placeholder}
              value={
                (table.getColumn(s.columnId)?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn(s.columnId)?.setFilterValue(event.target.value)
              }
              className="m-1 w-[150px] lg:h-8 lg:w-[250px]"
            />
          ))}

        {dateFilter && (
          <DataTableDateFilter column={table.getColumn(dateFilter.columnId)} />
        )}

        {multiSelectFilters?.map((f) => (
          <DataTableFacetedFilter
            key={f.title}
            options={f.options}
            title={f.title}
            column={f.columnId ? table.getColumn(f.columnId) : undefined}
            icon={f.icon}
          />
        ))}

        {numberFilter && (
          <DataTableNumberFilter
            column={table.getColumn(numberFilter.columnId)}
            title={numberFilter.title}
            currency={numberFilter.currency}
            icon={numberFilter.icon}
          />
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <DataTableViewOptions table={table} />
    </div>
  );
}
