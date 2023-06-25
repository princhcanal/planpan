import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
} from "../ui/AlertDialog";
import { DropdownMenuItem } from "../ui/DropdownMenu";
import { Trash } from "lucide-react";
import { Button } from "../ui/Button";
import { trpc } from "../../utils/trpc";
import type { TransactionType } from "../../server/db/schema/transactions";
import type { TransactionWithGuaps } from "./TransactionTable";

export interface TransactionDeleteDialogProps {
  guapId: string;
  transaction: TransactionWithGuaps;
}

export const TransactionDeleteDialog: React.FC<
  TransactionDeleteDialogProps
> = ({ guapId, transaction }) => {
  const utils = trpc.useContext();
  const deleteTransaction = trpc.transaction.deleteTransaction.useMutation({
    onSuccess: (_, deletedTransaction) => {
      utils.guap.getOne.invalidate({ id: guapId });
      utils.transaction.getTransactionsByGuap.invalidate({
        id: guapId,
      });

      if (deletedTransaction.internalGuapId) {
        utils.guap.getOne.invalidate({
          id: deletedTransaction.internalGuapId,
        });
        utils.transaction.getTransactionsByGuap.invalidate({
          id: deletedTransaction.internalGuapId,
        });
      }
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
          }}
        >
          <div className="flex items-center text-destructive">
            <Trash className="mr-2 cursor-pointer" />
            <p className="text-destructive">Delete</p>
          </div>
        </DropdownMenuItem>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
          Are you sure you want to delete this transaction? This action cannot
          be undone
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteTransaction.isLoading}>
            Cancel
          </AlertDialogCancel>

          <Button
            variant="destructive"
            isLoading={deleteTransaction.isLoading}
            onClick={() => {
              return deleteTransaction.mutate({
                ...transaction,
                guapId: transaction.guap.id,
                date: new Date(transaction.date).toISOString(),
                description: transaction.description ?? undefined,
                internalGuapId: transaction.internalGuap?.id ?? undefined,
                externalGuapId: transaction.externalGuap?.id ?? undefined,
                type: transaction.type as TransactionType,
              });
            }}
          >
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
