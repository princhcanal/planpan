import type { ColumnDef } from "@tanstack/react-table";
import type { RouterOutputs } from "../../utils/trpc";
import { DataTable } from "../ui/DataTable";
import { mapEnumToLabelValuePair } from "../../utils";
import { RecipientType } from "../../server/db/schema/wallets";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
} from "../ui/DropdownMenu";
import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/Button";
import { RecipientActions } from "./RecipientActions";

export type Recipient = RouterOutputs["recipient"]["getAll"][number];

interface RecipientTableProps {
  recipients: Recipient[];
}

export const RecipientTable: React.FC<RecipientTableProps> = ({
  recipients,
}) => {
  const columns: ColumnDef<Recipient>[] = [
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
              <RecipientActions recipient={row.original} />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={recipients}
      searchFilters={[
        { columnId: "name", placeholder: "Search Name" },
        { columnId: "description", placeholder: "Search Description" },
      ]}
      multiSelectFilters={[
        {
          columnId: "type",
          options: mapEnumToLabelValuePair(RecipientType),
          title: "Recipient Type",
        },
      ]}
    ></DataTable>
  );
};
