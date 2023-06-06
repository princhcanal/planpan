import {
  type ExternalGuap,
  type Guap,
  type Transaction,
  TransactionType,
} from "@prisma/client";
import { TrashIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { trpc } from "../../utils/trpc";
import { AlertDialog } from "../primitives/AlertDialog";
import numeral from "numeral";
import Link from "next/link";

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
        openButton={<TrashIcon className="cursor-pointer" />}
        onConfirm={() => {
          deleteTransaction.mutate({
            ...transaction,
            date: transaction.date.toISOString(),
          });
        }}
        isLoading={deleteTransaction.isLoading}
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        title="Delete Transaction?"
        description="Are you sure you want to delete this transaction? This action cannot be undone"
        confirmText="Delete"
        loadingConfirmText="Deleting"
      />
    </div>
  );
};
