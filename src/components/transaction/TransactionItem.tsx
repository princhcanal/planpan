import {
  type ExternalGuap,
  type Guap,
  type Transaction,
  TransactionType,
} from "@prisma/client";
import { useState } from "react";
import { trpc } from "../../utils/trpc";
import numeral from "numeral";
import Link from "next/link";
import { Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/AlertDialog";

interface TransactionItemProps {
  transaction: Transaction & {
    guap: Guap | null;
    externalGuap: ExternalGuap | null;
    internalGuap: Guap | null;
  };
  guapId: string;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  guapId,
}) => {
  const utils = trpc.useContext();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteTransaction = trpc.transaction.deleteTransaction.useMutation({
    onSuccess: () => {
      utils.guap.getOne.invalidate({ id: transaction.guapId as string });
      utils.transaction.getTransactionsByGuap.invalidate({
        id: transaction.guapId as string,
      });
      setIsDeleteDialogOpen(false);
    },
  });
  const isOutgoingTransaction =
    transaction.guapId === guapId &&
    transaction.type === TransactionType.OUTGOING;

  return (
    <div key={transaction.id} className="mb-4 rounded-md border p-4 shadow-md">
      <p>
        <span>Amount: </span>
        <span
          className={isOutgoingTransaction ? "text-red-500" : "text-green-500"}
        >
          {isOutgoingTransaction ? <span>- </span> : <span>+ </span>}
          <span>&#8369; {numeral(transaction.amount).format("0,0.00")}</span>
        </span>
      </p>
      <p>Description: {transaction.description}</p>
      <p>Date: {transaction.date.toDateString()}</p>
      {isOutgoingTransaction && (
        <p>
          <span>Sent To: </span>
          {transaction.externalGuap && (
            <span>{transaction.externalGuap.name}</span>
          )}
          {transaction.internalGuap && (
            <Link href={`/guaps/${transaction.internalGuapId}`}>
              {transaction.internalGuap.name}
            </Link>
          )}
        </p>
      )}
      {!isOutgoingTransaction && (
        <p>
          <span>Sent From: </span>
          {transaction.type === TransactionType.OUTGOING &&
            transaction.guap && (
              <Link href={`/guaps/${transaction.guapId}`}>
                {transaction.guap.name}
              </Link>
            )}
          {transaction.type === TransactionType.INCOMING &&
            transaction.externalGuap && (
              <span>{transaction.externalGuap.name}</span>
            )}
        </p>
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogTrigger>
          <Trash className="cursor-pointer" />
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            Are you sure you want to delete this transaction? This action cannot
            be undone
            <AlertDialogDescription></AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={() =>
                deleteTransaction.mutate({
                  ...transaction,
                  date: transaction.date.toISOString(),
                  description: transaction.description ?? undefined,
                  internalGuapId: transaction.internalGuapId ?? undefined,
                  externalGuapId: transaction.externalGuapId ?? undefined,
                })
              }
              isLoading={deleteTransaction.isLoading}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
