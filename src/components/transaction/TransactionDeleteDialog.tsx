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
import type { TransactionWithWallets } from "./TransactionTable";

export interface TransactionDeleteDialogProps {
  walletId: string;
  transaction: TransactionWithWallets;
}

export const TransactionDeleteDialog: React.FC<
  TransactionDeleteDialogProps
> = ({ walletId, transaction }) => {
  const utils = trpc.useContext();
  const deleteTransaction = trpc.transaction.deleteTransaction.useMutation({
    onSuccess: (_, deletedTransaction) => {
      utils.wallet.getOne.invalidate({ id: walletId });
      utils.transaction.getTransactionsByWallet.invalidate({
        id: walletId,
      });

      if (deletedTransaction.internalWalletId) {
        utils.wallet.getOne.invalidate({
          id: deletedTransaction.internalWalletId,
        });
        utils.transaction.getTransactionsByWallet.invalidate({
          id: deletedTransaction.internalWalletId,
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
                walletId: transaction.wallet.id,
                date: new Date(transaction.date).toISOString(),
                description: transaction.description ?? undefined,
                internalWalletId: transaction.internalWallet?.id ?? undefined,
                recipientId: transaction.recipient?.id ?? undefined,
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
