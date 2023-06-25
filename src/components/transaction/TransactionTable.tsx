import { DataTable } from "../ui/DataTable";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
} from "../ui/DropdownMenu";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowRightLeft, Banknote, MoreHorizontal, Send } from "lucide-react";
import numeral from "numeral";
import { Button } from "../ui/Button";
import { TransactionType } from "../../server/db/schema/transactions";
import { DataTableColumnHeader } from "../ui/DataTableColumnHeader";
import Link from "next/link";
import { mapEnumToLabelValuePair } from "../../utils";
import { type LabelValuePair } from "../form/SelectInput";
import { cn } from "../../lib/utils";
import { TransactionDeleteDialog } from "./TransactionDeleteDialog";
import { format } from "date-fns";
import { isBetween } from "../../utils/date";
import type { RouterOutputs } from "../../utils/trpc";

export type TransactionWithGuaps =
  RouterOutputs["transaction"]["getTransactionsByGuap"][number];

interface TransactionTableProps {
  guapId: string;
  guaps: LabelValuePair[];
  transactions: TransactionWithGuaps[];
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  guapId,
  guaps,
  transactions,
}) => {
  const columns: ColumnDef<TransactionWithGuaps>[] = [
    {
      id: "date",
      header: "Date",
      cell: ({ row }) => {
        return format(new Date(row.original.date), "iii, PPP");
      },
      filterFn: (row, _id, value) => {
        const date = row.original.date;
        const from = value.from;
        const to = value.to;

        if (from === undefined && to === undefined) {
          return true;
        }

        if (from !== undefined && to === undefined) {
          return format(new Date(date), "PPP") === format(from, "PPP");
        }

        if (from !== undefined && to !== undefined) {
          return isBetween(new Date(date), { from, to });
        }

        return false;
      },
    },
    {
      header: "Description",
      accessorKey: "description",
    },
    {
      header: "Type",
      accessorKey: "type",
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      id: "sent",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sent To/From" />
      ),
      cell: ({ row }) => {
        const isOutgoingTransaction =
          guapId === row.original.guap.id &&
          row.original.type === TransactionType.OUTGOING;

        if (isOutgoingTransaction) {
          if (row.original.externalGuap) {
            return <span>{row.original.externalGuap.name}</span>;
          }
          if (row.original.internalGuap) {
            return (
              <Link
                href={`/guaps/${row.original.internalGuap.id}`}
                className="underline"
              >
                {row.original.internalGuap.name}
              </Link>
            );
          }
        } else {
          if (row.original.type === TransactionType.OUTGOING) {
            return (
              <Link
                href={`/guaps/${row.original.guap.id}`}
                className="underline"
              >
                {row.original.guap.name}
              </Link>
            );
          } else if (
            row.original.type === TransactionType.INCOMING &&
            row.original.externalGuap
          ) {
            return <span>{row.original.externalGuap.name}</span>;
          }
        }
      },
      filterFn: (row, _id, value) =>
        value.includes(
          row.original.externalGuap?.id ??
            row.original.internalGuap?.id ??
            row.original.guap.id
        ),
    },
    {
      id: "amount",
      header: () => {
        return <p className="text-right">Amount</p>;
      },
      cell: ({ row }) => {
        const isOutgoingTransaction =
          guapId === row.original.guap.id &&
          row.original.type === TransactionType.OUTGOING;

        return (
          <p
            className={cn("text-right", {
              "text-destructive": isOutgoingTransaction,
              "text-success": !isOutgoingTransaction,
            })}
          >
            {isOutgoingTransaction ? <span>- </span> : <span>+ </span>}
            <span>&#8369; {numeral(row.original.amount).format("0,0.00")}</span>
          </p>
        );
      },
      filterFn: (row, _id, value) => {
        const amount =
          row.original.type === TransactionType.OUTGOING
            ? -row.original.amount
            : row.original.amount;

        if (
          value?.min !== null &&
          value?.min !== undefined &&
          (value?.max === null || value?.max === undefined)
        ) {
          return amount >= value.min;
        }

        if (
          value?.min !== null &&
          value?.min !== undefined &&
          value?.max !== null &&
          value?.max !== undefined
        ) {
          return amount >= value.min && amount <= value.max;
        }

        return false;
      },
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
              <TransactionDeleteDialog
                transaction={row.original}
                guapId={guapId}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={transactions}
      multiSelectFilters={[
        {
          columnId: "type",
          options: mapEnumToLabelValuePair(TransactionType),
          title: "Transaction Type",
          icon: ArrowRightLeft,
        },
        {
          columnId: "sent",
          options: guaps,
          title: "Sent To/From",
          icon: Send,
        },
      ]}
      searchFilters={[
        {
          columnId: "description",
          placeholder: "Search Description",
        },
      ]}
      dateFilter={{ columnId: "date" }}
      numberFilter={{
        columnId: "amount",
        title: "Amount",
        currency: "₱",
        icon: Banknote,
      }}
    />
  );
};
