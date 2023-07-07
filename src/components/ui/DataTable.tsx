import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  type SortingState,
  getSortedRowModel,
  type ColumnFiltersState,
  getFilteredRowModel,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "../ui/Table";
import { useEffect, useState } from "react";
import { DataTablePagination } from "./DataTablePagination";
import {
  DataTableToolbar,
  type NumberFilter,
  type DateFilter,
  type SearchFilter,
  type DataTableFilter,
} from "./DataTableToolbar";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  multiSelectFilters?: DataTableFilter[];
  searchFilters?: SearchFilter[];
  dateFilter?: DateFilter;
  numberFilter?: NumberFilter;
  hiddenColumnIds?: string[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  multiSelectFilters,
  searchFilters,
  dateFilter,
  numberFilter,
  hiddenColumnIds,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: { sorting, columnFilters, columnVisibility },
  });

  useEffect(() => {
    if (hiddenColumnIds) {
      table
        .getAllColumns()
        .filter((c) => hiddenColumnIds.includes(c.id))
        .forEach((c) => c.toggleVisibility(false));
    }
  }, [table, hiddenColumnIds]);

  return (
    <div>
      <div className="flex items-center py-4">
        <DataTableToolbar
          table={table}
          multiSelectFilters={multiSelectFilters}
          searchFilters={searchFilters}
          dateFilter={dateFilter}
          numberFilter={numberFilter}
          hiddenColumnIds={hiddenColumnIds}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="py-4">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
