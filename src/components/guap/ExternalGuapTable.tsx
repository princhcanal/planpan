import type { ColumnDef } from "@tanstack/react-table";
import type { RouterOutputs } from "../../utils/trpc";
import { DataTable } from "../ui/DataTable";
import { mapEnumToLabelValuePair } from "../../utils";
import { ExternalGuapType } from "../../server/db/schema/guaps";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
} from "../ui/DropdownMenu";
import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/Button";
import { ExternalGuapActions } from "./ExternalGuapActions";

export type ExternalGuap = RouterOutputs["externalGuap"]["getAll"][number];

interface ExternalGuapTableProps {
  externalGuaps: ExternalGuap[];
}

export const ExternalGuapTable: React.FC<ExternalGuapTableProps> = ({
  externalGuaps,
}) => {
  const columns: ColumnDef<ExternalGuap>[] = [
    { id: "name", header: "Name", accessorKey: "name" },
    { id: "description", header: "Description", accessorKey: "description" },
    {
      id: "type",
      header: "Type",
      accessorKey: "type",
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <ExternalGuapActions externalGuap={row.original} />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={externalGuaps}
      searchFilters={[
        { columnId: "name", placeholder: "Search Name" },
        { columnId: "description", placeholder: "Search Description" },
      ]}
      multiSelectFilters={[
        {
          columnId: "type",
          options: mapEnumToLabelValuePair(ExternalGuapType),
          title: "External Guap Type",
        },
      ]}
    ></DataTable>
  );
};
