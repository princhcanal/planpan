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
import { cn } from "../../lib/utils";
import { addHours, format } from "date-fns";
import { isBetween } from "../../utils/date";
import { TransactionActions } from "./TransactionActions";
import type { Wallet } from "../../pages/wallets/[id]";
import type { TransactionWithWallets } from "../../server/trpc/router/transaction";

interface TransactionTableProps {
  wallet?: Wallet;
  wallets: Wallet[];
  transactions: TransactionWithWallets[];
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  wallet,
  wallets,
  transactions,
}) => {
  const columns: ColumnDef<TransactionWithWallets>[] = [
    {
      id: "date",
      header: "Date",
      cell: ({ row }) => {
        return format(
          addHours(new Date(row.original.transactions.date), 8),
          "iii, PPP"
        );
      },
      filterFn: (row, _id, value) => {
        const date = row.original.transactions.date;
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
      id: "name",
      header: "Name",
      cell: ({ row }) => row.original.transactions.name,
      filterFn: (row, _id, value) =>
        row.original.transactions.name
          .toLowerCase()
          .includes(value.toLowerCase()),
    },
    {
      id: "description",
      header: "Description",
      cell: ({ row }) => {
        return (
          row.original.transactions.description ?? (
            <p className="text-muted-foreground">n/a</p>
          )
        );
      },
      filterFn: (row, _id, value) =>
        row.original.transactions.description
          ?.toLowerCase()
          .includes(value.toLowerCase()) ?? false,
    },
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => row.original.transactions.type,
      filterFn: (row, _id, value) =>
        value.includes(row.original.transactions.type),
    },
    {
      id: "transferredFrom",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Transferred From" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/wallets/${row.original.wallets.id}`}
          className="underline"
        >
          {row.original.wallets.name}
        </Link>
      ),
      filterFn: (row, _id, value) => value.includes(row.original.wallets.id),
    },
    {
      id: "transferredTo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Transferred To" />
      ),
      cell: ({ row }) => {
        if (!!row.original.internalWallet) {
          return (
            <Link
              href={`/wallets/${row.original.transactions.internalWalletId}`}
              className="underline"
            >
              {row.original.internalWallet.name}
            </Link>
          );
        }

        return <p className="text-muted-foreground">n/a</p>;
      },
      filterFn: (row, _id, value) =>
        value.includes(row.original.internalWallet?.id),
    },
    {
      id: "amount",
      header: () => {
        return <p className="text-right">Amount</p>;
      },
      cell: ({ row }) => {
        if (!wallet) {
          const isExpense =
            row.original.transactions.type === TransactionType.EXPENSE;
          const isIncome =
            row.original.transactions.type === TransactionType.INCOME;
          const isTransfer =
            row.original.transactions.type === TransactionType.TRANSFER;
          return (
            <p
              className={cn("text-right", {
                "text-destructive": isExpense,
                "text-success": !isExpense,
                "text-muted-foreground": isTransfer,
              })}
            >
              {isExpense && <span>- </span>}
              {isIncome && <span>+ </span>}
              <span>
                &#8369;{" "}
                {numeral(row.original.transactions.amount).format("0,0.00")}
              </span>
            </p>
          );
        }

        const isExpense =
          wallet.id === row.original.transactions.walletId &&
          row.original.transactions.type !== TransactionType.INCOME;

        return (
          <p
            className={cn("text-right", {
              "text-destructive": isExpense,
              "text-success": !isExpense,
            })}
          >
            {isExpense ? <span>- </span> : <span>+ </span>}
            <span>
              &#8369;{" "}
              {numeral(row.original.transactions.amount).format("0,0.00")}
            </span>
          </p>
        );
      },
      filterFn: (row, _id, value) => {
        if (!wallet) {
          const amount =
            row.original.transactions.type === TransactionType.EXPENSE
              ? -row.original.transactions.amount
              : row.original.transactions.amount;

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
        }

        const amount =
          row.original.transactions.type !== TransactionType.INCOME &&
          row.original.transactions.walletId === wallet.id
            ? -row.original.transactions.amount
            : row.original.transactions.amount;

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
              <TransactionActions
                transaction={row.original}
                wallets={wallets}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const multiSelectFilters = [
    {
      columnId: "type",
      options: mapEnumToLabelValuePair(TransactionType),
      title: "Transaction Type",
      icon: ArrowRightLeft,
    },
    {
      columnId: "transferredTo",
      options: wallets.map((w) => ({ label: w.name, value: w.id })),
      title: "Transferred To",
      icon: Send,
    },
  ];

  if (!wallet) {
    multiSelectFilters.splice(1, 0, {
      columnId: "transferredFrom",
      options: wallets.map((w) => ({ label: w.name, value: w.id })),
      title: "Transferred From",
      icon: Send,
    });
  }

  return (
    <DataTable
      columns={columns}
      data={transactions}
      multiSelectFilters={multiSelectFilters}
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
