import { Pencil, Trash } from "lucide-react";
import { trpc } from "../../utils/trpc";
import {
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/AlertDialog";
import { Button } from "../ui/Button";
import { DropdownMenuItem } from "../ui/DropdownMenu";
import type { TransactionType } from "../../server/db/schema/transactions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/Dialog";
import type { TransactionWithWallets } from "../../server/trpc/router/transaction";
import type { Wallet } from "../../pages/wallets/[id]";
import { TransactionForm } from "./TransactionForm";

export interface TransactionActionsProps {
  transaction: TransactionWithWallets;
  wallets: Wallet[];
}

export const TransactionActions: React.FC<TransactionActionsProps> = ({
  transaction,
  wallets,
}) => {
  const utils = trpc.useContext();

  const deleteTransaction = trpc.transaction.deleteTransaction.useMutation({
    onSuccess: (_, deletedTransaction) => {
      utils.transaction.getAllTransactions.invalidate();

      utils.wallet.getOne.invalidate({ id: transaction?.wallets.id });
      utils.transaction.getTransactionsByWallet.invalidate({
        id: transaction?.wallets.id,
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
    <>
      <Dialog>
        <DialogTrigger asChild>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <div className="flex w-full items-center">
              <Pencil className="mr-2" />
              <span>Edit</span>
            </div>
          </DropdownMenuItem>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>

          <TransactionForm
            wallets={wallets}
            existingTransaction={transaction.transactions}
          />
        </DialogContent>
      </Dialog>

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
                  id: transaction.transactions.id,
                  name: transaction.transactions.name,
                  amount: Number.parseFloat(transaction.transactions.amount),
                  walletId: transaction.transactions.walletId,
                  date: new Date(transaction.transactions.date).toISOString(),
                  description:
                    transaction.transactions.description ?? undefined,
                  internalWalletId:
                    transaction.transactions.internalWalletId ?? undefined,
                  type: transaction.transactions.type as TransactionType,
                });
              }}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
