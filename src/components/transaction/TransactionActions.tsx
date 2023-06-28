import {
  ArrowLeftRight,
  Minus,
  Pencil,
  Plus,
  Send,
  Trash,
  Wallet as WalletIcon,
} from "lucide-react";
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
import { TransactionType } from "../../server/db/schema/transactions";
import type { TransactionWithWallets } from "./TransactionTable";
import { useForm } from "react-hook-form";
import { mapEnumToLabelValuePair } from "../../utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/Dialog";
import type { z } from "zod";
import {
  transactionWithId,
  transactionRefine,
  transactionRefineMessage,
} from "../../types/zod";
import { Form } from "../form/Form";
import type { Wallet } from "../../pages/wallets/[id]";
import { useEffect, useState } from "react";
import numeral from "numeral";
import type { LabelValuePair } from "../form/SelectInput";

export interface TransactionActionsProps {
  wallet: Wallet;
  transaction: TransactionWithWallets;
  walletsExcludingSelf: LabelValuePair[];
}

export const TransactionActions: React.FC<TransactionActionsProps> = ({
  transaction,
  wallet,
  walletsExcludingSelf,
}) => {
  const utils = trpc.useContext();
  const editTransaction = trpc.transaction.editTransaction.useMutation({
    onSuccess: (_, editedTransaction) => {
      utils.wallet.getOne.invalidate({ id: wallet?.id });
      utils.transaction.getTransactionsByWallet.invalidate({
        id: wallet.id,
      });

      if (editedTransaction.internalWalletId) {
        utils.wallet.getOne.invalidate({
          id: editedTransaction.internalWalletId,
        });
        utils.transaction.getTransactionsByWallet.invalidate({
          id: editedTransaction.internalWalletId,
        });
      }
    },
  });

  const deleteTransaction = trpc.transaction.deleteTransaction.useMutation({
    onSuccess: (_, deletedTransaction) => {
      utils.wallet.getOne.invalidate({ id: wallet.id });
      utils.transaction.getTransactionsByWallet.invalidate({
        id: wallet.id,
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

  const transactionSchema = transactionWithId.refine(transactionRefine, {
    message: transactionRefineMessage,
    path: ["internalWalletId"],
  });

  const form = useForm<z.infer<typeof transactionSchema>>();
  const watchType = form.watch("type");
  const watchAmount = form.watch("amount");
  const watchInternalWalletId = form.watch("internalWalletId");

  const onSubmit = (data: z.infer<typeof transactionSchema>) => {
    if (
      watchType === TransactionType.INCOME ||
      (wallet.balance !== null &&
        wallet.balance !== undefined &&
        watchAmount <= Number.parseFloat(wallet.balance))
    ) {
      editTransaction.mutate(data);
    }
  };

  const [amountErrorMessage, setAmountErrorMessage] = useState("");
  const [walletErrorMessage, setWalletErrorMessage] = useState("");

  useEffect(() => {
    if (watchType !== TransactionType.TRANSFER) {
      form.resetField("internalWalletId", {
        defaultValue: undefined,
      });
    }
  }, [watchType, form]);

  useEffect(() => {
    if (
      (watchType === TransactionType.TRANSFER && !!watchInternalWalletId) ||
      watchType !== TransactionType.TRANSFER
    ) {
      setWalletErrorMessage("");
    }
  }, [watchInternalWalletId, watchType]);

  useEffect(() => {
    if (
      wallet.balance !== null &&
      wallet.balance !== undefined &&
      watchAmount > Number.parseFloat(wallet.balance) &&
      watchType !== TransactionType.INCOME
    ) {
      setAmountErrorMessage(
        `Not enough balance (₱ ${numeral(wallet.balance).format("0,0.00")})`
      );
    } else {
      setAmountErrorMessage("");
    }
  }, [watchAmount, watchType, form, wallet.balance]);

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

          <Form
            form={form}
            schema={transactionSchema}
            onSubmit={onSubmit}
            props={{
              walletId: {
                label: "Source Account",
                placeholder: "Choose Wallet",
                options: walletsExcludingSelf.concat({
                  label: wallet.name,
                  value: wallet.id,
                }),
                disabled: true,
              },
              type: {
                options: mapEnumToLabelValuePair(TransactionType, [
                  WalletIcon,
                  Send,
                  ArrowLeftRight,
                ]),
                defaultValue: transaction.type,
                disabled: true,
              },
              name: {
                label: "Name",
                placeholder: "Jollibee",
              },
              internalWalletId: {
                label: "Destination Account",
                placeholder: "Choose Wallet",
                options: walletsExcludingSelf.concat({
                  label: wallet.name,
                  value: wallet.id,
                }),
                hidden: watchType !== TransactionType.TRANSFER,
                errorMessage: walletErrorMessage,
                disabled: true,
              },
              amount: {
                placeholder: "5,000",
                label: "Amount",
                max: 1_000_000_000_000,
                errorMessage: amountErrorMessage,
                currency: "₱",
                sign: watchType === TransactionType.INCOME ? Plus : Minus,
              },
              description: {
                placeholder: "Birthday Celebration",
                label: "Description",
                type: "textarea",
              },
              date: {
                label: "Date",
              },
              id: {
                type: "hidden",
              },
            }}
            defaultValues={{
              ...transaction,
              amount: Number.parseFloat(transaction.amount),
              description: transaction.description ?? undefined,
              walletId: transaction.wallet.id,
              internalWalletId: transaction.internalWallet?.id,
              date: new Date(transaction.date).toISOString(),
            }}
            renderAfter={() => (
              <Button
                className="mt-4 w-full"
                isLoading={editTransaction.isLoading}
                type="submit"
                onClick={() => {
                  console.log(form.formState.errors);
                }}
              >
                Save
              </Button>
            )}
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
                  ...transaction,
                  name: transaction.name,
                  amount: Number.parseFloat(transaction.amount),
                  walletId: transaction.wallet.id,
                  date: new Date(transaction.date).toISOString(),
                  description: transaction.description ?? undefined,
                  internalWalletId: transaction.internalWallet?.id ?? undefined,
                  type: transaction.type as TransactionType,
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
