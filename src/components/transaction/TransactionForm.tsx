import { useForm } from "react-hook-form";
import {
  transaction,
  transactionRefine,
  transactionRefineMessage,
} from "../../types/zod";
import { Form } from "../form/Form";
import type { z } from "zod";
import type { Wallet } from "../../pages/wallets/[id]";
import { trpc } from "../../utils/trpc";
import {
  Send,
  ArrowLeftRight,
  Plus,
  Minus,
  Wallet as WalletIcon,
} from "lucide-react";
import {
  type Transaction,
  TransactionType,
} from "../../server/db/schema/transactions";
import { mapEnumToLabelValuePair } from "../../utils";
import { Button } from "../ui/Button";
import { useEffect, useState } from "react";
import numeral from "numeral";
import { addHours } from "date-fns";

interface TransactionFormProps {
  walletId?: string;
  existingTransaction?: Transaction;
  wallets: Wallet[];
  onSuccess?: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  walletId,
  existingTransaction,
  wallets,
  onSuccess,
}) => {
  const utils = trpc.useContext();
  const walletOptions = wallets.map((w) => ({ label: w.name, value: w.id }));
  const transactionSchema = transaction.refine(transactionRefine, {
    message: transactionRefineMessage,
    path: ["internalWalletId"],
  });
  const createTransaction = trpc.transaction.createTransaction.useMutation({
    onSuccess: () => {
      if (!!existingTransaction?.walletId || !!walletId) {
        utils.wallet.getOne.invalidate({
          id: existingTransaction?.walletId ?? walletId,
        });
        utils.transaction.getTransactionsByWallet.invalidate({
          id: existingTransaction?.walletId ?? walletId,
        });
      } else {
        utils.transaction.getAllTransactions.invalidate();
      }

      if (onSuccess) {
        onSuccess();
      }
    },
  });
  const editTransaction = trpc.transaction.editTransaction.useMutation({
    onSuccess: (_, editedTransaction) => {
      if (!existingTransaction) {
        utils.transaction.getAllTransactions.invalidate();
      }

      utils.wallet.getOne.invalidate({
        id: editedTransaction.walletId,
      });
      utils.transaction.getTransactionsByWallet.invalidate({
        id: editedTransaction.walletId,
      });

      if (editedTransaction.internalWalletId) {
        utils.wallet.getOne.invalidate({
          id: editedTransaction.internalWalletId,
        });
        utils.transaction.getTransactionsByWallet.invalidate({
          id: editedTransaction.internalWalletId,
        });
      }

      if (onSuccess) {
        onSuccess();
      }
    },
  });

  const onSubmit = (data: z.infer<typeof transactionSchema>) => {
    const wallet = wallets.find((w) => w.id === data.walletId);
    const hasEnoughBalance =
      !!wallet &&
      wallet.balance !== null &&
      wallet.balance !== undefined &&
      watchAmount <= Number.parseFloat(wallet.balance);

    if (watchType === TransactionType.INCOME || hasEnoughBalance) {
      if (existingTransaction) {
        editTransaction.mutate({ ...data, id: existingTransaction.id });
      } else {
        createTransaction.mutate(data);
      }
    }
  };

  const form = useForm<z.infer<typeof transactionSchema>>();
  const watchType = form.watch("type");
  const watchAmount = form.watch("amount");
  const watchWalletId = form.watch("walletId");
  const watchInternalWalletId = form.watch("internalWalletId");
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
    const wallet = wallets.find((w) => w.id === watchWalletId);
    const hasEnoughBalance =
      !!wallet &&
      wallet.balance !== null &&
      wallet.balance !== undefined &&
      (watchAmount ?? 0) <= Number.parseFloat(wallet.balance);

    if (!!wallet && !hasEnoughBalance && watchType !== TransactionType.INCOME) {
      setAmountErrorMessage(
        `Not enough balance (₱ ${numeral(wallet.balance).format("0,0.00")})`
      );
    } else {
      setAmountErrorMessage("");
    }
  }, [watchAmount, watchType, form, wallets, watchWalletId]);

  const defaultValues = {
    type: existingTransaction?.type ?? TransactionType.EXPENSE,
    walletId: existingTransaction?.walletId ?? walletId,
    name: existingTransaction?.name,
    amount: existingTransaction
      ? Number.parseFloat(existingTransaction.amount)
      : undefined,
    description: existingTransaction?.description ?? undefined,
    internalWalletId: existingTransaction?.internalWalletId ?? undefined,
    date: existingTransaction?.date
      ? addHours(new Date(existingTransaction.date), 8).toISOString()
      : undefined,
  };

  // filter wallet options based on form value
  return (
    <Form
      form={form}
      schema={transactionSchema}
      onSubmit={onSubmit}
      props={{
        walletId: {
          label: "Source Account",
          placeholder: "Choose Wallet",
          options: walletOptions.filter(
            (w) => w.value !== watchInternalWalletId
          ),
          disabled: !!existingTransaction || !!walletId,
        },
        type: {
          options: mapEnumToLabelValuePair(TransactionType, [
            WalletIcon,
            Send,
            ArrowLeftRight,
          ]),
          defaultValue: existingTransaction?.type ?? TransactionType.EXPENSE,
          disabled: !!existingTransaction,
        },
        name: {
          label: "Name",
          placeholder: "Jollibee",
        },
        internalWalletId: {
          label: "Destination Account",
          placeholder: "Choose Wallet",
          options: walletOptions.filter((w) => w.value !== watchWalletId),
          hidden: watchType !== TransactionType.TRANSFER,
          errorMessage: walletErrorMessage,
          disabled: !!existingTransaction,
        },
        amount: {
          placeholder: "5,000",
          label: "Amount",
          max: 1_000_000_000_000,
          errorMessage: amountErrorMessage,
          currency: "₱",
          sign:
            watchType === TransactionType.INCOME
              ? Plus
              : watchType === TransactionType.EXPENSE
              ? Minus
              : undefined,
        },
        description: {
          placeholder: "Birthday Celebration",
          label: "Description",
          type: "textarea",
        },
        date: {
          label: "Date",
          defaultNow: true,
        },
      }}
      defaultValues={defaultValues}
      renderAfter={() => (
        <Button
          className="mt-4 w-full"
          isLoading={createTransaction.isLoading || editTransaction.isLoading}
          type="submit"
          onClick={() => {
            console.log("form:", form);
            console.log("form errors:", form.formState.errors);
          }}
        >
          Save
        </Button>
      )}
    />
  );
};
