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
import { addHours, format } from "date-fns";
import { isBetween } from "../../utils/date";
import type { RouterOutputs } from "../../utils/trpc";

export type TransactionWithWallets =
  RouterOutputs["transaction"]["getTransactionsByWallet"][number];

interface TransactionTableProps {
  walletId: string;
  wallets: LabelValuePair[];
  transactions: TransactionWithWallets[];
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  walletId,
  wallets,
  transactions,
}) => {
  const columns: ColumnDef<TransactionWithWallets>[] = [
    {
      id: "date",
      header: "Date",
      cell: ({ row }) => {
        return format(addHours(new Date(row.original.date), 8), "iii, PPP");
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
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Description",
      id: "description",
      cell: ({ row }) => {
        return (
          row.original.description ?? (
            <p className="text-muted-foreground">n/a</p>
          )
        );
      },
      filterFn: (row, _id, value) =>
        row.original.description?.includes(value) ?? false,
    },
    {
      header: "Type",
      accessorKey: "type",
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      id: "transfer",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Transferred To/From" />
      ),
      cell: ({ row }) => {
        const isTransfer = row.original.type === TransactionType.TRANSFER;

        if (
          isTransfer &&
          row.original.wallet.id === walletId &&
          row.original.internalWallet
        ) {
          return (
            <Link
              href={`/wallets/${row.original.internalWallet.id}`}
              className="underline"
            >
              {row.original.internalWallet.name}
            </Link>
          );
        }

        if (isTransfer) {
          return (
            <Link
              href={`/wallets/${row.original.wallet.id}`}
              className="underline"
            >
              {row.original.wallet.name}
            </Link>
          );
        }

        return <p className="text-muted-foreground">n/a</p>;
      },
      filterFn: (row, _id, value) => {
        const isTransfer = row.original.type === TransactionType.TRANSFER;

        if (isTransfer && row.original.wallet.id === walletId) {
          return value.includes(row.original.internalWallet?.id);
        }

        if (isTransfer && row.original.wallet.id !== walletId) {
          return value.includes(row.original.wallet.id);
        }
      },
    },
    {
      id: "amount",
      header: () => {
        return <p className="text-right">Amount</p>;
      },
      cell: ({ row }) => {
        const isExpense =
          walletId === row.original.wallet.id &&
          row.original.type !== TransactionType.INCOME;

        return (
          <p
            className={cn("text-right", {
              "text-destructive": isExpense,
              "text-success": !isExpense,
            })}
          >
            {isExpense ? <span>- </span> : <span>+ </span>}
            <span>&#8369; {numeral(row.original.amount).format("0,0.00")}</span>
          </p>
        );
      },
      filterFn: (row, _id, value) => {
        const amount =
          row.original.type !== TransactionType.INCOME
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
                walletId={walletId}
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
          columnId: "transfer",
          options: wallets,
          title: "Transferred To/From",
          icon: Send,
        },
      ]}
      searchFilters={[
        {
          columnId: "name",
          placeholder: "Search Name",
        },
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
